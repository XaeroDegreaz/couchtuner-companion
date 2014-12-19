/**
 * Created by XaeroDegreaz on 11/30/2014.
 */
(function () {
    app.controller('HistoryController', [
        '$scope', 'SyncService', 'SettingsService', 'HistoryScanService',
        function ($scope, SyncService, SettingsService, HistoryScanService) {
            var syncService = SyncService;
            $scope.history = syncService.getHistory();
            $scope.settings = SettingsService.settings;

            $scope.removeHistoryItem = function ($event, item) {
                SyncService.removeHistoryItem(item);
                $scope.history = syncService.getHistory();
            };

            $scope.getNiceName = function (string) {
               return HistoryScanService.getNiceName(string);
            };
        }]);
})();