/**
 * Created by XaeroDegreaz on 10/11/2014.
 */
(function(){
    app.controller("SettingsController", ["$scope", "$http", "$aside", 'SyncService', function ($scope, $http, $aside, SyncService) {
        var syncService = $scope.syncService = SyncService;
        $scope.optionTracks = "No";
    }]);
})();