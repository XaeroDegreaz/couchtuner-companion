/**
 * Created by XaeroDegreaz on 10/5/2014.
 */
var app = angular.module("CouchtunerCompanion", ['ui.bootstrap', 'mgcrea.ngStrap'], function ($compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension):|data:image\//);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
});
(function () {
    //# http://www.zzstream.li/2014/10/intruders-s1-e7-the-crossing-place.html
    var historyLinkRegex = "((s\\d+)-(e\\d+))";

    var closeButton = document.createElement("button");
    closeButton.setAttribute("ng-click", "doClick()");
    closeButton.setAttribute("class", "btn btn-lg btn-primary navbar-brand navbar navbar-fixed-top");
    closeButton.setAttribute("id", "ccSidebarToggle");
    closeButton.setAttribute("ng-init", "initializeStuff()");
    closeButton.appendChild(document.createTextNode("☰"));
    document.getElementsByTagName("body")[0].appendChild(closeButton);

    var root = document.documentElement;
    root.setAttribute("ng-app", "CouchtunerCompanion");
    root.setAttribute("ng-csp", "CouchtunerCompanion");
    root.setAttribute("ng-controller", "SidebarController");

    var controller = app.controller("SidebarController", ["$scope", "$http", "$aside", 'SyncService', function ($scope, $http, $aside, SyncService) {
        var myaside = $aside({
            "title": "Couchtuner Companion",
            "template": chrome.extension.getURL("html/sidebar.html"),
            "placement": "left",
            //"animation": "am-fadeAndSlideLeft",
            "show": false,
            "scope": $scope
        });

        var syncService = $scope.syncService = SyncService;

        $scope.doClick = function () {
            myaside.show();
        };

        $scope.initializeStuff = function () {

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

                    $scope.parseLinks();
                    var links = $scope.parseOtherLinks();
                    $scope.createBookmarkButtons(links);
                });
            });
        };

        $scope.createBookmarkButtons = function (links) {
            var bookmarks = syncService.getBookmarks();
            var q = Enumerable.from(bookmarks);
            $(links).each(function (index) {
                var a = $(this);
                var url = a.attr('href');
                var isBookmarked = q.any(function (x) {
                    var bool = x.url === url;
                    return bool;
                });
                var buttonType = isBookmarked ? "warning" : "success";
                var buttonText = isBookmarked ? "-" : "+";
                var button = $('<button class="btn btn-xs btn-' + buttonType + '">' + buttonText + '</button>')
                    .appendTo(a.parent())
                    .after(a)
                    .click(function (event) {
                        $scope.bookmark(a, button);
                    });

                button.attr("style", "margin-right: 2px; width: 10px;");
                syncService.links[url] = button;
            });
        };

        $scope.bookmark = function (a, button) {
            var url = a.attr('href');
            var name = a.html().replace("<strong>", "").replace("</strong>", "");
            var q = Enumerable.from(syncService.getBookmarks());
            var isBookmarked = q.any(function (x) {
                return x.url === url;
            });

            $scope.doBookmarkRoutine(isBookmarked, url, name);

            var buttonType = isBookmarked ? "success" : "warning";
            var buttonText = isBookmarked ? "+" : "-";

            button.attr("class", "btn btn-xs btn-" + buttonType).html(buttonText);
        };

        $scope.doBookmarkRoutine = function (isBookmarked, url, name) {
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

                if (syncService.links[url]) {
                    var button = syncService.links[url];
                    button.attr("class", "btn btn-xs btn-success").html("+");
                }
            }
            syncService.sync('bookmarks');
        };

        $scope.parseOtherLinks = function () {
            var links = [];
            $('.entry a[href], #left a[href], #right a[href] ').each(function (index) {
                var a = $(this);
                var href = a.attr("href");
                var html = a.html();
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
        };

        $scope.parseLinks = function () {
            var reg = $('a:regex(href,' + historyLinkRegex + ')');
            reg.each(function (index) {
                $(this).click(function (event) {
                    //event.preventDefault();
                    $scope.addToHistory($(this).attr('href'), $(this).html());
                });
            });
            //console.log(reg);
        };

        $scope.removeHistoryItem = function (item) {
            var q = Enumerable.from(syncService.getHistory());
            var remaining = q.where(function (x) {
                return x !== item;
            }).toArray();
            syncService.setHistory(remaining);
            syncService.sync("history");
        };

        $scope.addToHistory = function (link, name) {
            syncService.getHistory().push({
                url: link,
                name: name,
                time: new Date().getTime()
            });
            syncService.sync('history');
        };
    }]);
})();