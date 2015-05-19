/**
 * Created by XaeroDegreaz on 11/24/2014.
 */
(function () {
	app.controller('BookmarkController', [
		'$scope', '$compile', 'SyncService', 'BookmarkScanService', 'SidebarService',
		function ($scope, $compile, SyncService, BookmarkScanService, SidebarService) {
			$scope.bookmarks = [];
			$scope.dateCompare = null;
			$scope.visibleBookmarks = [];
            $scope.searchText = null;
            $scope.searchBookmarks = null;
			SyncService.bookmarkListener = function () {
				resizeContent();
				var query = Enumerable.from(SyncService.getBookmarks());
				$scope.bookmarks = query.where("$ !== null").orderBy("$.name").toArray();
                $scope.searchBookmarks = null;
                if($scope.searchText){
                    $scope.searchBookmarks = Enumerable.from($scope.bookmarks ).where(function(x){
                        return x.name.toLowerCase().indexOf($scope.searchText.toLowerCase()) > -1;
                    } ).toArray();
                }
                var targetArray = $scope.searchBookmarks !== null ? $scope.searchBookmarks : $scope.bookmarks;
				$scope.visibleBookmarks = targetArray;
			};

			$scope.pageChanged = function(){
                SyncService.bookmarkListener();
			};

			$scope.onBookmarkRemove = function ($event, bookmark) {
				//# Need unsorted list for our indexes.
				var bookmarks = SyncService.getBookmarks();
				var bookmarkIndex = bookmarks.indexOf(bookmark);
				//# Have the bookmark service find any links on the main page that correspond
				//# to this bookmark, and have their button reflect its new status
				BookmarkScanService.unbookmark(bookmarkIndex);
			};

			function resizeContent(){
				var searchBox = $('#searchBox');
				var tabContent = $('#tabContent');
				var searchBoxOffset = searchBox.offset();
				var leftover = $(window ).height() - (searchBoxOffset.top + searchBox.outerHeight(true));
                SidebarService.tabContentHeight = leftover;
				tabContent.height(leftover);
			}

            resizeContent();
		}
	]);
})();