/**
 * Created by XaeroDegreaz on 11/30/2014.
 */
(function () {
    app.controller('HistoryController', [
        '$scope', 'SyncService', 'SettingsService',
        function ($scope, SyncService, SettingsService) {
            var syncService = SyncService;
            $scope.history = syncService.getHistory();
            $scope.settings = SettingsService.settings;

            $scope.removeHistoryItem = function ($event, item) {
                SyncService.removeHistoryItem(item);
                $scope.history = syncService.getHistory();
            };

            $scope.getNiceName = function (string) {
                var regex = /(.+>)?([\w '.,"]+)(<\w+>)?(S)(eason)?(.+)?(\d+)(.+)?(E)(pisode)?(.+)?(\d+)/;
                var groups = regex.exec(string);
                var showName = groups[2];
                var season = getNiceNumber(groups[7]);
                var episode = getNiceNumber(groups[12]);

                return showName + " - S" + season + "E" + episode;
            };

            function getNiceNumber(number) {
                return (number >= 0 && number < 10) ? "0" + number : number;
            }
        }]);
})();