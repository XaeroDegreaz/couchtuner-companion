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