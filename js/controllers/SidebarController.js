/**
 * Created by XaeroDegreaz on 11/24/2014.
 */
(function () {
    app.controller('SidebarController', [
        '$scope', '$aside', '$compile', 'SettingsService', 'SyncService', 'BookmarkScanService', 'HistoryScanService',
        function ($scope, $aside, $compile, SettingsService, SyncService, BookmarkScanService, HistoryScanService) {
            var manifest = chrome.runtime.getManifest();
            var isDevMode = (manifest.update_url == null);
            var version = manifest.version + (isDevMode ? " - (DEVELOPMENT)" : "");

            var sidebar = $aside({
                "title": "Couchtuner Companion " + version,
                "template": chrome.extension.getURL("html/sidebar.html"),
                "placement": "left",
                "animation": "am-fadeAndSlideLeft",
                "show": false,
                "scope": $scope
            });

            $scope.tabs = {
                settingsTab: chrome.extension.getURL("html/settingsTab.html"),
                bookmarksTab: chrome.extension.getURL("html/bookmarksTab.html"),
                historyTab: chrome.extension.getURL("html/historyTab.html")
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
                });
            }();

            $scope.go = function (url) {
                window.location.href = url;
            };

            $scope.openSidebar = function () {
                sidebar.show();
                $(".aside").scroll(function (e) {
                    $(this).scrollLeft(0);
                });
            };
        }
    ]);
})();