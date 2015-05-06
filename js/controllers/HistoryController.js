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
            //# Filtering
            $scope.currentPage = 1;
            $scope.itemsPerPage = 14;
            $scope.maxPages = 4;
            $scope.visibleHistory = $scope.history;
            $scope.searchText = null;
            $scope.searchHistory = null;

            $scope.removeHistoryItem = function ($event, item) {
                SyncService.removeHistoryItem(item);
                $scope.history = syncService.getHistory();
                $scope.pageChanged();
            };

            $scope.getNiceName = function (string) {
               return HistoryScanService.getNiceName(string);
            };

            $scope.pageChanged = function(){
                $scope.searchHistory = null;
                if($scope.searchText){
                    $scope.searchHistory = Enumerable.from($scope.history ).where(function(x){
                        return $scope.getNiceName(x.name).toLowerCase().indexOf($scope.searchText.toLowerCase()) > -1;
                    } ).toArray();
                }
                var targetArray = $scope.searchHistory !== null ? $scope.searchHistory : $scope.history;
                $scope.visibleHistory = targetArray.slice(($scope.currentPage - 1) * $scope.itemsPerPage, $scope.currentPage * $scope.itemsPerPage);
            };

            var init = function(){
                $scope.pageChanged();
            }();
        }]);
})();