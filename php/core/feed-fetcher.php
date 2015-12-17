<?php

// My includes
require_once("constants.php");

// Third party includes
require_once("../DrSlump/Protobuf.php");
use \DrSlump\Protobuf;
Protobuf::autoload();
require_once("../google/gtfs-realtime.php");
use transit_realtime\FeedMessage;

if (isset($_GET['update'])) {
    fetchData(false);
}

function fetchData($silent = true) {
    $start = microtime(true);

    // Download the feed data
    $ref = microtime(true);
    $realEntities = [];
    $data = file_get_contents(Constants::FEED_URL);
    file_put_contents("feed.protobuf", $data);
    $feed = new FeedMessage();
    $feed->parse($data);
    foreach($feed->getEntityList() as $entity) {
        if ($entity->hasVehicle()) {
            $vehicle = $entity->getVehicle();
            if ($vehicle->hasPosition()) {
                array_push($realEntities, $entity);
            }
        }
    }
    $time = microtime(true) - $ref;
    $content = "Data fetched and parsed in $time<br>";

// Sort the vehicles into data groups
    $ref = microtime(true);
    $sortedVehicles = [];
    foreach ($realEntities as $entity) {
        $vehicle = $entity->getVehicle();
        $route = $vehicle->getTrip()->getRouteId();
        $tripId = $vehicle->getTrip()->getTripId();
        $name = substr($route, 0, strpos($route, "-"));
        if (strpos($route, "-") === false && strpos($tripId, "UNPLANNED") !== false) {
            $name = "$route (Extra)";
        }

        if (array_key_exists($name, $sortedVehicles)) {
            array_push($sortedVehicles[$name], $entity);
        } else {
            $sortedVehicles[$name] = [$entity];
        }
    }
    $time = microtime(true) - $ref;
    $content .= "Data sorted in $time<br>";

    $ref = microtime(true);
    deleteExistingData();

    foreach ($sortedVehicles as $key => $value) {
        saveRouteAsJson($sortedVehicles[$key], Constants::DATA_DIR . $key . ".json");
    }

    saveBusListAsJson($sortedVehicles);
    $time = microtime(true) - $ref;
    $content .= "Data saved in $time<br>";

    $time = microtime(true) - $start;

    $content .= "Operation completed successfully in $time<br>";

    if (!$silent) {
        echo $content;
    }
}

function deleteExistingData() {
    $files = glob(Constants::DATA_DIR); // get all file names
    foreach($files as $file){ // iterate files
        if(is_file($file))
            unlink($file); // delete file
    }
}

function saveRouteAsJson($array, $file) {
    file_put_contents($file, json_encode($array));
}

function saveBusListAsJson($array) {
    $buses = [];
    foreach ($array as $key => $value) {
        array_push($buses, [
            "Route" => $key,
            "Count" => count($array[$key]),
            "DisplayText" => (isString($key) ? "train" : "bus") . (count($array[$key]) > 1 ? (isString($key) ? "s" : "es") : ""),
            "Bus" => (isString($key) ? "false" : "true"),
            "Selected" => "false"
        ]);
    }
    file_put_contents(Constants::DATA_DIR . "buslist.json", json_encode(recursiveMapToString($buses)));
}

function recursiveMapToString($array) {
    foreach ($array as $key => $value) {
        if (is_array($value)) {
            $array[$key] = recursiveMapToString($value);
        } else {
            $array[$key] = strval($value);
        }
    }
    return $array;
}

function isString($test) {
    if (!preg_match('/[^A-Za-z]/', $test)) // '/[^a-z\d]/i' should also work.
    {
        return true;
    }
    return false;
}
