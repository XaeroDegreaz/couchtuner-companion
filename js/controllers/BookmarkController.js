/**
 * Created by XaeroDegreaz on 11/24/2014.
 */
(function () {
    app.controller('BookmarkController', [
        '$scope, SyncService, BookmarkScanService',
        function ($scope, SyncService, BookmarkScanService) {
            $scope.bookmarks = SyncService.getBookmarks();

            $scope.onBookmarkButtonClick = function (bookmark) {
                var bookmarks = $scope.bookmarks;
                var query = Enumerable.from(bookmarks);
                var isBookmarked = query.any('$.name === bookmark.name');
                if (isBookmarked) {
                    BookmarkScanService.unbookmark(bookmark);
                } else {
                    BookmarkScanService.bookmark(bookmark);
                }
            };
        }
    ]);
})();