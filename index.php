<?php
?>
<html lang="en" ng-app="Flerovium">
<head>
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/angular_material/0.10.1/angular-material.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=RobotoDraft:300,400,500,700,400italic">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <meta name="viewport" content="initial-scale=1" />
    <link rel="stylesheet" href="css/main.css">
    <title>Flero - A Faster Way</title>
</head>
<body layout="column" ng-controller="AppCtrl">
<md-toolbar layout="row">
    <div class="md-toolbar-tools">
        <md-button ng-click="toggleSidenav('left')" hide-gt-sm class="md-icon-button">
            <md-icon aria-label="Menu" md-svg-icon="https://s3-us-west-2.amazonaws.com/s.cdpn.io/68133/menu.svg"></md-icon>
        </md-button>
        <h1>Flero - A Faster Way</h1>
        <span flex></span>
        <!--<md-button class="md-icon-button" aria-label="Refresh" ng-click="refreshData()">
            <i class="material-icons">refresh</i>
        </md-button>-->
    </div>
</md-toolbar>
<div layout="row" flex>
    <md-sidenav layout="column" class="md-sidenav-left md-whiteframe-z2" md-component-id="left" md-is-locked-open="$mdMedia('gt-sm')">
        <md-list>
            <md-list-item class="md-2-line">
                <div class="md-list-item-text" >
                    <h3>Developed by Joseph Garrone</h3>
                    <p><a class="mail-to" href="mailto:josephgarrone+flero@gmail.com">Email: josephgarrone+flero@gmail.com</a></p>
                </div>
            </md-list-item>
        </md-list>
        <md-divider></md-divider>
        <md-input-container>
            <label>Search for bus or train route</label>
            <input type="text" ng-model="busFilter">
        </md-input-container>
        <md-list id="vehicleList">
            <md-list-item class="md-1-line" ng-repeat="vehicle in vehicles | filter:busFilter | orderBy:'Route' track by vehicle.Route">
                <md-checkbox ng-model="vehicle.Selected" ng-change="toggleBus(vehicle, selected)"></md-checkbox>
                <div class="md-list-item-text">
                    <i ng-if="vehicle.Bus == 'true'" class="material-icons">directions_bus</i>
                    <i ng-if="vehicle.Bus == 'false'" class="material-icons">directions_transit</i>
                </div>
                <div class="md-list-item-text" layout-margin>
                    <h3>{{vehicle.Route}}</h3>
                </div>
                <div class="md-list-item-text" layout-margin>
                    <p>{{vehicle.Count}} {{vehicle.DisplayText}}</p>
                </div>
            </md-list-item>
        </md-list>
    </md-sidenav>
    <div layout="column" flex id="content">
        <md-content layout="column" flex>
            <div id="map-canvas"></div>
        </md-content>
    </div>
</div>
<!-- Angular Material Dependencies -->
<script src="js/angular/angular.js"></script>
<script src="js/angular/angular-animate.js"></script>
<script src="js/angular/angular-aria.js"></script>
<script src="js/angular/ng-map.js"></script>
<script src="js/ng-storage/ngStorage.js"></script>

<script src="https://ajax.googleapis.com/ajax/libs/angular_material/0.10.1/angular-material.min.js"></script>

<!-- Google Maps -->
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?sensor=false"></script>

<!-- Protobuf JS -->
<!--<script src="js/protobuf/protobuf.js"></script>-->

<!-- Illogicalbit Includes -->
<script src="js/main.js"></script>
<script src="js/request.js"></script>
<script src="js/bus-loader.js"></script>

<!-- Google Analytics -->
<script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-67473369-1', 'auto');
    ga('send', 'pageview');

</script>

</body>
</html>