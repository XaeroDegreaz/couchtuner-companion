/**
 * Created by XaeroDegreaz on 10/11/2014.
 */
(function () {
    app.service('LinkService', function () {
        var links = [];
        return {
            getLinks: function () {
                return links;
            },
            linkBookmarkButton: function (url, button) {
                if (links[url]) {
                    var backupButton = links[url];
                    links[url] = [];
                    links[url].push(backupButton, button);
                } else {
                    links[url] = button;
                }
            },
            toggleBookmarkButtons: function (isBookmarked, name) {
                var buttonType = isBookmarked ? "success" : "warning";
                var buttonText = isBookmarked ? "+" : "-";

                if (links[name]) {
                    if (links[name] instanceof Array) {
                        links[name].forEach(function (b) {
                            b.attr("class", "btn btn-xs btn-" + buttonType).html(buttonText);
                        });
                    } else {
                        links[name].attr("class", "btn btn-xs btn-" + buttonType).html(buttonText);
                    }
                }
            }
        }
    });
})();