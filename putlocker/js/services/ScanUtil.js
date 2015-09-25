/**
 * Created by XaeroDegreaz on 11/24/2014.
 */
(function () {
    /**
     * This service scans the page for show links, and stores various
     * information about those links. It then creates buttons, and so forth,
     * so that the links can be clicked, and unclicked.
     */
    app.service('ScanUtil', function () {
        var serviceObject = {
            getDeepestHtml: function (a) {
                var title = a.attr("title");
                if (title) {
                    var titleWithYearRegex = /^(.+)\s+(\(\d+\))?\s*$/;
                    var titleWithShowAndEpisode = /(.+>)?([\w '.,"]+)(.+)(S)(eason)?(\D+)?(\d+)(.+)?([eE])(pisode)?(\D+)?(\d+)/;
                    var groups;
                    if (groups = titleWithYearRegex.exec(title)) {
                        return groups[1];
                    } else if (titleWithShowAndEpisode.exec(title)) {
                        return title;
                    }
                }

                var $target = a.children();

                while ($target.length) {
                    $target = $target.children();
                }

                return $target.end().html();
            }
        };

        return serviceObject;
    });
})();