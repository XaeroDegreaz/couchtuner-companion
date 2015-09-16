/**
 * Created by XaeroDegreaz on 11/30/2014.
 */
(function () {
    app.controller('HistoryController', [
        '$scope', 'SyncService', 'SettingsService', 'HistoryScanService', 'SidebarService',
        function ($scope, SyncService, SettingsService, HistoryScanService, SidebarService) {
            var syncService = SyncService;
            $scope.history = syncService.getHistory();
            $scope.settings = SettingsService.settings;
            $scope.visibleHistory = $scope.history;
            $scope.searchText = null;
            $scope.searchHistory = null;
            $scope.sidebarService = SidebarService;

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
                $scope.visibleHistory = targetArray;
            };

            var init = function(){
                $scope.pageChanged();
            }();
        }]);
})();