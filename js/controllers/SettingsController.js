/**
 * Created by XaeroDegreaz on 10/11/2014.
 */
(function(){
    app.controller("SettingsController", ["$scope", "$http", "$aside", 'SyncService', function ($scope, $http, $aside, SyncService) {
        var syncService = $scope.syncService = SyncService;
        $scope.historyTracking = "Off";
        $scope.bookmarkStorage = "Local";

        var onInitialize = function(){
            syncService.retrieve("settings", function(items){

            });
        }();
    }]);
})();