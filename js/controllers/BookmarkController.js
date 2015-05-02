/**
 * Created by XaeroDegreaz on 11/24/2014.
 */
(function () {
    app.controller('BookmarkController', [
        '$scope', '$compile', 'SyncService', 'BookmarkScanService',
        function ($scope, $compile, SyncService, BookmarkScanService) {
            $scope.bookmarks = [];

            var onInitialize = function () {
                getSortedBookmarks();
            }();

            function getSortedBookmarks() {
                var query = Enumerable.from(SyncService.getBookmarks());
                $scope.bookmarks = query.where("$ !== null").orderBy("$.name").toArray();

                $.each($scope.bookmarks, function (index, bookmark) {
                    //var bookmark = $scope.bookmarks[0];
                    bookmark.nextUp = (bookmark.nextUp) ? bookmark.nextUp : "Loading...";
                    //# TODO Add some sort of daily /weekly time limits for re-requesting data.
                    $.get("http://localhost:8080/" + bookmark.name)
                        .success(function (data) {
                            $scope.$apply(function () {
                                console.log(data);
                                bookmark.bannerString = data;
                                bookmark.dateCompare = getDateCompareInt(data);
                            });
                        });
                });
            }

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

            $scope.onBookmarkRemove = function ($event, bookmark) {
                //# Need unsorted list for our indexes.
                var bookmarks = SyncService.getBookmarks();
                var bookmarkIndex = bookmarks.indexOf(bookmark);
                //# Have the bookmark service find any links on the main page that correspond
                //# to this bookmark, and have their button reflect its new status
                BookmarkScanService.unbookmark(bookmarkIndex);
                getSortedBookmarks();
            };
        }
    ]);
})();