'use strict';

/* Controllers */
var app = angular.module('myApp.controllers', ['ngResource']);

app.controller('MyCtrl1', ['$scope', function($scope) {

    }]);

app.controller('MyCtrl2', [function() {

    }]);

app.controller('switcher', ['$scope', 'socket', function($scope, socket) {
        $scope.mixerValue=100;  //start on PGM
        $scope.currentPgmBtn = 1;
        $scope.currentPreviewBtn = 0;
        $scope.programButtons = [{idx: 0, class: "switchOFF", id: "CAM1"}, {idx: 1, class: "switchON", id: "CAM2"}, {idx: 2, class: "switchOFF", id: "CAM3"}, {idx: 3, class: "switchOFF", id: "VTR1"}, {idx: 4, class: "switchOFF", id: "VTR2"}];
        $scope.previewButtons = [{idx: 0, class: "switchON", id: "CAM1"}, {idx: 1, class: "switchOFF", id: "CAM2"}, {idx: 2, class: "switchOFF", id: "CAM3"}, {idx: 3, class: "switchOFF", id: "VTR1"}, {idx: 4, class: "switchOFF", id: "VTR2"}];
        socket.emit('cutProgram', $scope.currentPgmBtn);
        socket.on("pgmTimecode", function(data) {
            $scope.programButtons[$scope.currentPgmBtn].class = "switchOFF";
            $scope.programButtons[data.unit].class = "switchON";
            $scope.currentPgmTimecode = data.timecode;
            $scope.currentPgmBtn     = data.unit;
        });
        socket.on("swap", function(data) {
            //console.log("swap pgm and prv!!");
            //console.log("current PGM: "+$scope.currentPgmBtn+", current PRV: "+$scope.currentPreviewBtn);
            
            $scope.previewButtons.forEach(function(item) {
                item.class = "switchOFF";
            });
            $scope.programButtons.forEach(function(item) {
                item.class = "switchOFF";
            });
            //console.log("new PGM: "+data.pgm+", new PRV: "+data.prv);
            $scope.previewButtons[data.prv].class = "switchON";
            $scope.programButtons[data.pgm].class = "switchON";
            $scope.currentPgmBtn = data.pgm;
            $scope.currentPreviewBtn = data.prv;
        });

        $scope.cutPgm = function(btn) {
            //console.log("program cut: "+btn);
            socket.emit("cutProgram", btn);
            
            //$scope.currentPgmBtn = btn;
        };
        $scope.cutPreview = function(btn) {
            //console.log("preview cut: "+btn);
            socket.emit("cutPreview", btn);
            $scope.previewButtons[$scope.currentPreviewBtn].class = "switchOFF";
            $scope.previewButtons[btn].class = "switchON";
            $scope.currentPreviewBtn = btn;
        };
        $scope.$watch('mixerValue', function(newValue, oldValue) {
           //console.log("updated mixerValue received, old: "+oldValue+", new: "+newValue);
           if (oldValue !== newValue) {
               socket.emit("mix", {mix: newValue});
           }
        });
    }]);