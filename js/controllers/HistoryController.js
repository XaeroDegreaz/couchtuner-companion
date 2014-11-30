/**
 * Created by XaeroDegreaz on 11/30/2014.
 */
(function () {
    app.controller('HistoryController', [
        '$scope', 'SyncService',
        function ($scope, SyncService) {
            var syncService = SyncService;
            $scope.history = syncService.getHistory();

            $scope.removeHistoryItem = function ($event, item) {
                SyncService.removeHistoryItem(item);
                $scope.history = syncService.getHistory();
            };

            $scope.getNiceName = function (string) {
                var regex = /(.+)?(S)(eason)?(.+)?(\d+)(.+)?(E)(pisode)?(.+)?(\d+)/;
                var groups = regex.exec(string);
                var showName = groups[1];
                var season = getNiceNumber(groups[5]);
                var episode = getNiceNumber(groups[10]);

                return showName + " - S" + season + "E" + episode;
            };

            function getNiceNumber(number) {
                return (number >= 0 && number < 10) ? "0" + number : number;
            }
        }]);
})();