/**
 * Created by XaeroDegreaz on 05/02/2015.
 */
(function () {
    app.controller('BookmarkItemController', [
        '$scope', 'TvApiService',
        function ($scope, TvApiService) {
            $scope.dateCompare = null;
            $scope.bannerString = TvApiService.isEnabled() ? 'Loading...' : null;
            var bookmark = $scope.bookmark;

            $scope.onInitialize = function () {
                TvApiService.findNextEpisodeDate(bookmark.name, function (date) {
                    $scope.$apply(function () {
                        $scope.bannerString = date;
                        $scope.dateCompare = getDateCompareInt(date);
                    });
                });
            };

            function getDateCompareInt(date) {
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1;
                var yyyy = today.getFullYear();

                if (dd < 10) {
                    dd = '0' + dd
                }

                if (mm < 10) {
                    mm = '0' + mm
                }

                today = yyyy + '' + mm + '' + dd;
                date = date.replace(/-/g, '');
                if (date < today) {
                    return -1;
                } else if (date == today) {
                    return 0;
                } else {
                    return 1;
                }
            }
        }
    ]);
})();