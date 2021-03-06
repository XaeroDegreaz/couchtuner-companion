/**
 * Created by XaeroDegreaz on 11/24/2014.
 */
(function () {
    app.controller('SidebarController', [
        '$scope', '$compile', 'SettingsService', 'SyncService', 'BookmarkScanService', 'HistoryScanService', 'TvApiService',
        function ($scope, $compile, SettingsService, SyncService, BookmarkScanService, HistoryScanService, TvApiService) {
            var manifest = chrome.runtime.getManifest();
            var isDevMode = (manifest.update_url == null);
            $scope.version = manifest.version + (isDevMode ? " - (D)" : "");
            $scope.companionName = manifest.name;
            $scope.companionGitName = $scope.companionName.replace(" ", "-").toLowerCase();
            $scope.tabContentHeight = 0;
            $scope.snapOptions = {
                touchToDrag: false
            };
            var onInitialize = function () {
                //# Tell sync service to do whatever it needs to do to retrieve information from Chrome storage.
                SyncService.initialize(function () {
                    SettingsService.initialize();
                    //# Tell bookmark scan service to scan the page for bookmarkable shows.
                    BookmarkScanService.initialize();
                    //# Tell history scan service to scan the page for shows that, when clicked, will
                    //# enter an item into the history to be synced, and also represent previously
                    //# viewed shows in an easy to identify manner.
                    HistoryScanService.initialize();
                    TvApiService.initialize();

                    $scope.tabs = {
                        settingsTab: chrome.extension.getURL("common-html/settingsTab.html"),
                        bookmarksTab: chrome.extension.getURL("common-html/bookmarksTab.html"),
                        historyTab: chrome.extension.getURL("common-html/historyTab.html")
                    };
                });
            }();

            $scope.go = function (url) {
                window.location.href = url;
            };

            $scope.openSidebar = function () {
                SyncService.bookmarkListener();
            };
        }
    ]);
})();