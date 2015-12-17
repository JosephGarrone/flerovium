var app = angular.module('Flerovium', ['ngMaterial', 'ngMap', 'ngStorage']);
var map = null;

app.controller('AppCtrl', ['$scope', '$mdSidenav', '$timeout', '$localStorage', function($scope, $mdSidenav, $timeout, $localStorage){
    $scope.vehicles = [];
    $scope.selected = [];
    $scope.overlays = [];
    $scope.$storage = $localStorage.$default({savedBuses: ["380", "385"]});

    $scope.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };

    $scope.$on('mapInitialized', function(event, map) {
        $scope.map = map;
    });

    $scope.toggleBus = function(item, list) {
        var index = list.indexOf(item);
        if (index > -1) {
            list.splice(index, 1)
        } else {
            list.push(item);
        }
        $scope.displaySelected();
    };

    $scope.displaySelected = function(initial) {
        var oldOverlays = $scope.overlays;

        for (var j = 0; j < oldOverlays.length; j++) {
            var v = oldOverlays[j];
            v.visible = false;
            v.setMap(null);
        }

        if (initial) {
            for (var j = 0; j < $scope.vehicles.length; j++) {
                if (typeof $scope.vehicles[j] == 'undefined' || typeof $scope.vehicles[j].Route == 'undefined') {
                    continue;
                }
                if (initial) {
                    if ($scope.$storage.savedBuses.indexOf($scope.vehicles[j].Route) > -1) {
                        $scope.vehicles[j].Selected = true;
                        $scope.toggleBus($scope.vehicles[j], $scope.vehicles);
                    }
                }
            }
        }

        for (var i = 0; i < $scope.selected.length; i++) {
            var route = $scope.selected[i].Route;
            Request.get("php/core/get-data.php?file="+route+".json", function(response) {
                for (var i = 0; i < response.length; i++) {
                    addVehicle($scope, response[i]);
                }
            });
        }

    };

    $scope.updateVehicles = function(data) {
        for (var i = 0; i < data.length; i++) {
            var found = false;
            for (var j = 0; j < $scope.vehicles.length; j++) {
                if ($scope.vehicles[j].Route == data[i].Route) {
                    $scope.vehicles[j].Count = data[i].Count;
                    $scope.vehicles[j].DisplayText = data[i].DisplayText;
                    found = true;
                    break;
                }
            }

            if (!found) {
                $scope.vehicles.push(data[i]);
            }
        }

        for (i = $scope.selected.length - 1; i > -1; i--) {
            found = false;
            for (j = 0; j < data.length; j++) {
                if ($scope.selected[i].Route == data[j].Route) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                $scope.selected.splice(i, 1);
            }
        }
    };

    $scope.refreshBus = function(initial) {
        Request.get("php/core/get-data.php?file=buslist.json", function(response) {
            $scope.updateVehicles(response);
            $scope.$apply();
            $scope.displaySelected(initial);
        });
    };

    $scope.refreshData = function() {
        Request.get("php/core/feed-fetcher.php", function(response) {console.log("Refreshed...")});
        $scope.displaySelected();
    };

    $scope.refresh = function(initial) {
        $scope.refreshBus(initial);
        $timeout($scope.refresh, 7500);
    };
    $scope.refresh(true);
}]);

app.directive("mdSidenav", ['$document', function($document) {
    return {
        restrict: 'A',
        replace: false,
        scope: { enabled: '=mdSidenav' } };
}]);

app.controller("busListController", ['$scope', '$mdSidenav', function($scope, $mdSidenav) {

}]);

function addVehicle($scope, entity) {
    var vehicle = entity.vehicle;
    var position = vehicle.position;
    var lat = position.latitude;
    var long = position.longitude;
    var newVehicle = new Vehicle(new google.maps.LatLngBounds(
        new google.maps.LatLng(lat + 0.00010, long - 0.00010),
        new google.maps.LatLng(lat - 0.00010, long + 0.00010)
    ), entity, map, $scope);
    $scope.overlays.push(newVehicle);
}

function InitialiseGoogleMaps() {
    var mapOptions = {
        center: {lat: -27.473483, lng: 153.019314},
        zoom: 16
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

Vehicle.prototype = new google.maps.OverlayView();

function Vehicle(bounds, entity, map, $scope)
{
    this.bounds_ = bounds;
    this.entity_ = entity;
    this.map_ = map;
    this.value_ = "";
    this.$scope = $scope;

    this.div_ = null;

    this.setMap(map);
}

Vehicle.prototype.onAdd = function()
{
    var div = document.createElement('div');
    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';

    // Create the img element and attach it to the div.
    div.innerHTML =this.getRoute();
    div.style.background = "rgba(0, 0, 255, 0.35)";

    this.div_ = div;

    // Add the element to the "overlayLayer" pane.
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(div);
};

Vehicle.prototype.getRoute = function() {
    var raw = this.entity_.vehicle.trip.route_id;

    if (raw.indexOf("-") < 0) {
        return raw;
    } else {
        return raw.substring(0, raw.indexOf("-"));
    }

};

Vehicle.prototype.draw = function()
{
    // We use the south-west and north-east
    // coordinates of the overlay to peg it to the correct position and size.
    // To do this, we need to retrieve the projection from the overlay.
    var overlayProjection = this.getProjection();

    // Retrieve the south-west and north-east coordinates of this overlay
    // in LatLngs and convert them to pixel coordinates.
    // We'll use these coordinates to resize the div.
    var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

    // Resize the image's div to fit the indicated dimensions.
    var div = this.div_;
    var e = this.entity_;

    if (typeof div !== "undefined")
    {
        div.style.left = sw.x + 'px';
        div.style.top = ne.y + 'px';
        div.style.width = (ne.x - sw.x) + 'px';
        div.style.height = (sw.y - ne.y) + 'px';
        div.applyCSS({width:"20px", height: "12px", textAlign: "center", border: "2px solid rgba(0, 0, 255, 0.8)", color: "white"});
        var d = new Date(0);
        d.setUTCSeconds(e.vehicle.timestamp.low);
        this.value_ = e.id + " : " + e.vehicle.vehicle.label + ", Last Updated: " + (d.getHours().toString().length > 1 ? d.getHours() : "0" + d.getHours()) + ":" + (d.getMinutes().toString().length > 1 ? d.getMinutes() : "0" + d.getMinutes());
    }
};

Vehicle.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
};

google.maps.event.addDomListener(window, 'load', InitialiseGoogleMaps);


Element.prototype.applyCSS = function(styling)
{
    if (styling != null)
    {
        for (var style in styling)
        {
            if (styling.hasOwnProperty(style) && (style in this.style))
            {
                try
                {
                    this.style[style] = styling[style];
                }
                catch (e)
                {
                }
            }
        }
    }
};