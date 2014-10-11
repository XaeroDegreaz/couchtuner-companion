/**
 * Created by XaeroDegreaz on 10/11/2014.
 */
(function () {
    app.service('LinkService', function (SyncService) {
        var syncService = SyncService;
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
            }
        }
    });
})();