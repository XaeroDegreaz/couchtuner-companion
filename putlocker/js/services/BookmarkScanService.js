/**
 * Created by XaeroDegreaz on 11/24/2014.
 */
(function () {
    /**
     * This service scans the page for show links, and stores various
     * information about those links. It then creates buttons, and so forth,
     * so that the links can be clicked, and unclicked.
     */
    app.service('BookmarkScanService', function (SyncService, ScanUtil) {
        var showLinks = [];
        var bookmarks;
        var serviceObject = {
            initialize: function () {
                bookmarks = SyncService.getBookmarks();
                populateShowLinks();
                generateBookmarkButtons();
            },

            getShowNameFromLink: function (link) {
                return ScanUtil.getDeepestHtml(link);
            },

            generateBookmarkButton: function (bookmarkIndex, linkIndex) {
                var isBookmarked = bookmarkIndex !== -1;
                var buttonType = isBookmarked ? "danger" : "success";
                var buttonText = isBookmarked ? "-" : "+";
                var button = angular.element("<button class='btn btn-xs btn-" + buttonType + "'>" + buttonText + "</button>");
                button.attr("style", "margin-right: 2px; width: 15px;");
                button.click(function () {
                    onBookmarkButtonClick(bookmarkIndex, linkIndex);
                });
                return button;
            },

            unbookmark: function (bookmarkIndex) {
                //# Fix any bookmarks on the page to represent new state of this bookmark
                var bookmark = bookmarks[bookmarkIndex];
                var query = Enumerable.from(showLinks);
                var links = query.where(function (x) {
                    return serviceObject.getShowNameFromLink(x) === bookmark.name;
                }).toArray();
                $(links).each(function (linkIndex, link) {
                    linkIndex = showLinks.indexOf(link);
                    var button = serviceObject.generateBookmarkButton(-1, linkIndex);
                    link.bookmarkButton.replaceWith(button);
                    link.bookmarkButton = button;
                });

                bookmarks = SyncService.removeBookmark(bookmarkIndex);
            },

            bookmark: function (linkIndex) {
                var link = showLinks[linkIndex];
                var showName = this.getShowNameFromLink(link);
                var bookmark = new Bookmark(showName, link.attr('href'));
                bookmarks = SyncService.addBookmark(bookmark);
                var bookmarkIndex = bookmarks.indexOf(bookmark);
                var query = Enumerable.from(showLinks);
                var links = query.where(function (x) {
                    return serviceObject.getShowNameFromLink(x) === showName;
                }).toArray();
                $(links).each(function (linkIndex, link) {
                    linkIndex = showLinks.indexOf(link);
                    var button = serviceObject.generateBookmarkButton(bookmarkIndex, linkIndex);
                    link.bookmarkButton.replaceWith(button);
                    link.bookmarkButton = button;
                });
            }
        };

        function Bookmark(name, url) {
            this.name = name;
            this.url = url;
        }

        function onBookmarkButtonClick(bookmarkIndex, linkIndex) {
            console.log(bookmarkIndex, linkIndex);
            if (bookmarkIndex === -1) {
                serviceObject.bookmark(linkIndex);
            } else {
                serviceObject.unbookmark(bookmarkIndex);
            }
        }

        /**
         * Create an array of qualified show links, wrapped in a jQuery selector.
         */
        function populateShowLinks() {
            $('.table a[href], .table2 a[href]').each(function (index) {
                var a = $(this);
                var href = a.attr("href");
                var html = a.html();

                if (html.indexOf("<img") != -1 || href.indexOf(".html") == -1) {
                    return;
                }

                html = ScanUtil.getDeepestHtml(a);

                var regex = /(#)|(google)|(season)|(episode\-)|(tv\-list)/i;
                var regex2 = /(.+)?(S)(eason)?(.+)?(\d+)(.+)?(E)(pisode)?(.+)?(\d+)/i;
                if (!href || regex.exec(href) || regex2.exec(href) || regex2.exec(html)) {
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

        function generateBookmarkButtons() {
            var query = Enumerable.from(bookmarks);
            $(showLinks).each(function (linkIndex, a) {
                var bookmarkIndex = bookmarks.indexOf(query.firstOrDefault(function (x) {
                    var showName = serviceObject.getShowNameFromLink(a);
                    return x.name === showName;
                }));
                var button = serviceObject.generateBookmarkButton(bookmarkIndex, linkIndex);
                button.appendTo(a.parent()).after(a);
                //# Injected into the object for later use.
                a.bookmarkButton = button;
            });
        }

        return serviceObject;
    });
})();