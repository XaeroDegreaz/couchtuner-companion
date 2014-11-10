/**
 * Created by XaeroDegreaz on 10/5/2014.
 */
$("html").attr("ng-app", "CouchtunerCompanion");
$("html").attr("ng-controller", "SidebarController");
$("body").prepend(
    $("<div ng-include=\"'" + chrome.extension.getURL("html/sidebarButton.html") + "'\"/>")
);
var app = angular.module("CouchtunerCompanion", [ 'ui.bootstrap', 'mgcrea.ngStrap'], function ($compileProvider, $sceDelegateProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension):|data:image\//);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
    $sceDelegateProvider.resourceUrlWhitelist(["self", "chrome-extension://**"]);
});
(function () {
    //# http://www.zzstream.li/2014/10/intruders-s1-e7-the-crossing-place.html
    var historyLinkRegex = "((s\\d+)-(e\\d+))|((s\\d+)(e\\d+))";

    app.controller("SidebarController", ["$scope", "$http", "$aside", 'SyncService', 'LinkService', function ($scope, $http, $aside, SyncService, LinkService) {
        var syncService = $scope.syncService = SyncService;
        var linkService = $scope.linkService = LinkService;

        var sidebar = $aside({
            "title": "Couchtuner Companion",
            "template": chrome.extension.getURL("html/sidebar.html"),
            "placement": "left",
            "animation": "am-fadeAndSlideLeft",
            "show": false,
            "scope": $scope
        });
        $scope.templates = {
            settingsTab: chrome.extension.getURL("html/settingsTab.html"),
            bookmarksTab: chrome.extension.getURL("html/bookmarksTab.html"),
            historyTab: chrome.extension.getURL("html/historyTab.html")
        };

        $scope.go = function (url) {
            window.location.href = url;
        };

        //# Constructor
        var onInitialize = function () {
            retrieveData(function () {
                parseHistoryTrackableLinks();
                createBookmarkButtons(parseBookmarkableLinks());
            });
        }();

        $scope.openSidebar = function () {
            sidebar.show();
        };

        function retrieveData(callback) {
            syncService.retrieve('bookmarks', function (items) {
                if (!items.bookmarks) {
                    syncService.sync('bookmarks');
                }

                //console.log(syncService.getBookmarks());

                syncService.retrieve('history', function (items) {
                    if (!items.history) {
                        syncService.sync('history');
                    }

                    //console.log(syncService.getHistory());
                    callback();
                });
            });
        }

        function createBookmarkButtons(links) {
            var bookmarks = syncService.getBookmarks();
            var q = Enumerable.from(bookmarks);
            $(links).each(function (index) {
                var a = $(this);
                var url = a.attr('href');
                var isBookmarked = q.any(function (x) {
                    var bool = x.name === getShowNameFromLink(a);
                    return bool;
                });
                var buttonType = isBookmarked ? "danger" : "success";
                var buttonText = isBookmarked ? "-" : "+";
                /*
                 var buttonText = isBookmarked ? "remove" : "bookmark";
                 var buttonIcon = "<i class='glyphicon glyphicon-" + buttonText + "'></i>"
                 */
                var button = $('<button class="btn btn-xs btn-' + buttonType + '">' + buttonText + '</button>')
                    .appendTo(a.parent())
                    .after(a)
                    .click(function (event) {
                        onBookmarkButtonClick(a, button);
                    });

                button.attr("style", "margin-right: 2px; width: 10px;");
                linkService.linkBookmarkButton(getShowNameFromLink(a), button);
            });
        }

        function getShowNameFromLink(a) {
            return a.html().replace("<strong>", "").replace("</strong>", "");
        }

        function onBookmarkButtonClick(a, button) {
            var url = a.attr('href');
            var name = getShowNameFromLink(a);
            var q = Enumerable.from(syncService.getBookmarks());
            var isBookmarked = q.any(function (x) {
                return x.url === url;
            });

            $scope.performBookmarkButtonSyncOperation(isBookmarked, url, name);
        }

        $scope.performBookmarkButtonSyncOperation = function (isBookmarked, url, name) {
            var q = Enumerable.from(syncService.getBookmarks());

            if (!isBookmarked) {
                syncService.getBookmarks().push({
                    url: url,
                    name: name
                });
            } else {
                var remaining = q.where(function (x) {
                    return x.url !== url
                }).toArray();
                syncService.setBookmarks(remaining);
            }

            linkService.toggleBookmarkButtons(isBookmarked, name);
            syncService.sync('bookmarks');
        };

        function parseBookmarkableLinks() {
            var links = [];
            $('.entry a[href], #left a[href], #right a[href] ').each(function (index) {
                var a = $(this);
                var href = a.attr("href");
                var html = a.html();

                if (!a.parent().is("li") && !a.parent().is("strong")) {
                    return;
                }

                if (!href ||
                    href.indexOf("#") == 0 ||
                    href.indexOf("google") >= 0 ||
                    //# Episode list area
                    html.indexOf("Season") >= 1 || href.indexOf("season") > 1 ||
                    html.indexOf("Episode") >= 1 || href.indexOf("episode\\-") > 1) {
                    return;
                }

                if (a.length === 1) {
                    links.push(a);
                    return;
                }

                var strong = $(this).find('strong');

                if (strong.length === 1) {
                    a = strong.find('a');

                    if (a.length === 1) {
                        links.push(a);
                    }
                }
            });

            return links;
        }

        var hasHistoryPropogated = false;

        function parseHistoryTrackableLinks() {
            var reg = $('a:regex(href,' + historyLinkRegex + ')');
            reg.each(function (index) {
                $(this).click(function (event) {
                    if (!hasHistoryPropogated) {
                        event.preventDefault();
                        $scope.addHistoryItem($(this).attr('href'), $(this).html());
                        hasHistoryPropogated = true;
                        $(this).trigger('click');
                    } else {
                        window.location.href = $(this).attr("href");
                    }
                });
            });
            //console.log(reg);
        }

        $scope.removeHistoryItem = function (item) {
            var q = Enumerable.from(syncService.getHistory());
            var remaining = q.where(function (x) {
                return x !== item;
            }).toArray();
            syncService.setHistory(remaining);
            syncService.sync("history");
        };

        $scope.getNiceName = function (string) {
            var regex = /(.+)?(S)(eason)?(.+)?(\d+)(.+)?(E)(pisode)?(.+)?(\d+)/;
            var groups = regex.exec(string);
            var showName = groups[1]
            var season = getNiceNumber(groups[5]);
            var episode = getNiceNumber(groups[10]);

            return showName + " - S" + season + "E" + episode;
        };

        function getNiceNumber(number) {
            return (number >= 0 && number < 10) ? "0" + number : number;
        }

        $scope.addHistoryItem = function (link, name) {
            syncService.getHistory().push({
                url: link,
                name: name,
                time: new Date().getTime()
            });
            syncService.sync('history');
        };
    }]);
})();