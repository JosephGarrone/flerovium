<?php

// My includes
require_once("constants.php");
require_once("feed-fetcher.php");

$file = Constants::DATA_DIR . $_GET['file'];

if (file_exists($file) && !file_exists(Constants::DATA_DIR . Constants::DATA_FETCH_IN_PROGRESS)) {
    $time = date(filemtime($file));
    $now = strtotime('now');
    $diff = $now - $time;

    if ($diff > Constants::MAX_DATA_AGE) {
        file_put_contents(Constants::DATA_DIR . Constants::DATA_FETCH_IN_PROGRESS, "true");
        fetchData();
        unlink(Constants::DATA_DIR . Constants::DATA_FETCH_IN_PROGRESS);
    }
}

echo file_get_contents($file);