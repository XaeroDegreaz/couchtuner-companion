/**
 * Created by XaeroDegreaz on 11/24/2014.
 */
(function () {
    app.controller('BookmarkController', [
        '$scope', 'SyncService', 'BookmarkScanService',
        function ($scope, SyncService, BookmarkScanService) {
            $scope.bookmarks = SyncService.getBookmarks();

            $scope.onBookmarkButtonClick = function ($event, bookmark) {
                var bookmarks = $scope.bookmarks;
                var bookmarkIndex = bookmarks.indexOf(bookmark);
                //# Needed because the div parent has an ngclick on it so that the whole cell is clickable.
                $event.stopPropagation();
                //# Perform the actual removing of keys.
                SyncService.removeBookmark(bookmarkIndex);
                //# Have the bookmark service find any links on the main page that correspond
                //# to this bookmark, and have their button reflect its new status
                BookmarkScanService.unbookmark(bookmark)
                //BookmarkScanService.unbookmark(bookmark);
                /*if (isBookmarked) {
                 BookmarkScanService.unbookmark(bookmark);
                 } else {
                 BookmarkScanService.bookmark(bookmark);
                 }*/
            };
        }
    ]);
})();