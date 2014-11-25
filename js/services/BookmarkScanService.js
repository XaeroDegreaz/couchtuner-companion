/**
 * Created by XaeroDegreaz on 11/24/2014.
 */
(function () {
    /**
     * This service scans the page for show links, and stores various
     * information about those links. It then creates buttons, and so forth,
     * so that the links can be clicked, and unclicked.
     */
    app.service('BookmarkScanService', ['SyncService', function (SyncService) {
        var showLinks = [];
        var bookmarks;
        var serviceObject = {
            initialize: function () {
                bookmarks = SyncService.getBookmarks();
                setShowLinks();
                createBookmarkButtons();
            },

            getShowNameFromLink: function (link) {
                return link.html().replace("<strong>", "").replace("</strong>", "");
            },

            generateBookmarkButton: function (bookmarkIndex) {
                var isBookmarked = bookmarkIndex !== -1;
                var buttonType = isBookmarked ? "danger" : "success";
                var buttonText = isBookmarked ? "-" : "+";
                var button = $("<button ng-click='onBookmarkButtonClick(" + bookmarkIndex + ")' class='btn btn-xs btn-" + buttonType + "'>" + buttonText + "</button>");
                button.attr("style", "margin-right: 2px; width: 10px;");
                return button;
            }
        };

        /**
         * Create an array of qualified show links, wrapped in a jQuery selector.
         */
        function setShowLinks() {
            $('.entry a[href], #left a[href], #right a[href] ').each(function (index) {
                var a = $(this);
                var href = a.attr("href");
                var html = a.html();

                if (!a.parent().is("li") && !a.parent().is("strong")) {
                    return;
                }

                //# Clean this using regex..
                if (!href ||
                    href.indexOf("#") == 0 ||
                    href.indexOf("google") >= 0 ||
                    //# Episode list area
                    html.indexOf("Season") >= 1 || href.indexOf("season") > 1 ||
                    html.indexOf("Episode") >= 1 || href.indexOf("episode\\-") > 1) {
                    return;
                }

                if (a.length === 1) {
                    showLinks.push(a);
                    return;
                }

                var strong = $(this).find('strong');

                if (strong.length === 1) {
                    a = strong.find('a');
                    if (a.length === 1) {
                        showLinks.push(a);
                    }
                }
            });
        }

        function createBookmarkButtons() {
            var query = Enumerable.from(bookmarks);

            $(showLinks).each(function () {
                var a = $(this);
                var bookmarkIndex = bookmarks.indexOf(query.firstOrDefault(function (x) {
                    var showName = serviceObject.getShowNameFromLink(a);
                    return x.name === showName;
                }));
                var button = serviceObject.generateBookmarkButton(bookmarkIndex);
                button.appendTo(a.parent()).after(a);
            });
        }

        return serviceObject;
    }]);
})();