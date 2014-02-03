'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
        controller('MyCtrl1', ['$scope', function($scope) {

            }])
        .controller('MyCtrl2', [function() {

            }])
        .controller('switcher', ['$scope', function($scope) {
                $scope.currentPgmBtn = 1;
                $scope.currentPreviewBtn = 0;
                $scope.programButtons = [{idx: 0, class: "switchOFF", id: "CAM1"}, {idx: 1, class: "switchON", id: "CAM2"}, {idx: 2, class: "switchOFF", id: "CAM3"}, {idx: 3, class: "switchOFF", id: "VTR1"}, {idx: 4, class: "switchOFF", id: "VTR2"}];
                $scope.previewButtons = [{idx: 0, class: "switchON", id: "CAM1"}, {idx: 1, class: "switchOFF", id: "CAM2"}, {idx: 2, class: "switchOFF", id: "CAM3"}, {idx: 3, class: "switchOFF", id: "VTR1"}, {idx: 4, class: "switchOFF", id: "VTR2"}];

                $scope.cutPgm = function(btn) {
                    $scope.programButtons[$scope.currentPgmBtn].class = "switchOFF";
                    $scope.programButtons[btn].class = "switchON";
                    $scope.currentPgmBtn = btn;
                };
                $scope.cutPreview = function(btn) {
                    $scope.previewButtons[$scope.currentPreviewBtn].class = "switchOFF";
                    $scope.previewButtons[btn].class = "switchON";
                    $scope.currentPreviewBtn = btn;
                };
            }]);