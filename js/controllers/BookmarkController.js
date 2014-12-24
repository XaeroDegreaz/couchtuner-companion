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

               // $.each($scope.bookmarks, function (index, bookmark) {
                    var bookmark = $scope.bookmarks[0];
                    bookmark.nextUp = (bookmark.nextUp) ? bookmark.nextUp : "Loading...";
                    //# TODO Add some sort of daily /weekly time limits for re-requesting data.
                    $.get("http://localhost:8080/demo?showName=" + bookmark.name)
                     .success(function (data) {
                            $scope.$apply(function(){
                                console.log(data);
                                var date = data.childNodes[0].childNodes[5].innerHTML;
                                var season = data.childNodes[0].childNodes[7].innerHTML;
                                var episode = data.childNodes[0].childNodes[3].innerHTML;
                                bookmark.nextUp = date;
                                bookmark.bannerString = season+"x"+episode+" - "+date;
                            });
                     });
                //});
            }

            $scope.getLatestEpisode = function(bookmark) {
                bookmark.nextUp = "No information available...";
                $.get("http://localhost:8080/demo?showName=" + bookmark.name)
                    .success(function (data) {
                        console.log(data);
                        bookmark.nextUp = data.childNodes[0].childNodes[5].innerHTML;
                    });
            };

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