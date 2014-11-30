/**
 * Created by XaeroDegreaz on 11/24/2014.
 */
(function () {
    app.service('HistoryScanService', ['SyncService', function (SyncService) {
        var historyLinkRegex = "(.+)?(S)(eason)?(.+)?(\\d+)(.+)?(E)(pisode)?(.+)?(\\d+)";
        var hasHistoryPropogated = false;

        function parseHistoryTrackableLinks() {
            var reg = $('a:regex(href, ' + historyLinkRegex + ' )');
            reg.each(function (index) {
                $(this).click(addHistoryItem);
            });
        }

        function addHistoryItem(event) {
            if (!hasHistoryPropogated) {
                event.preventDefault();
                var a = $(event.target);
                var link = a.attr('href');
                var name = a.html();
                SyncService.addHistoryItem(new HistoryItem(link, name));
                //# Place this property inside the link instead of scope polluting
                hasHistoryPropogated = true;
                $(this).trigger('click');
            } else {
                window.location.href = $(this).attr("href");
            }
        }

        function HistoryItem(url, name) {
            this.url = url;
            this.name = name;
            this.time = new Date().getTime()
        }

        return{
            initialize: function () {
                parseHistoryTrackableLinks();
            }
        }
    }]);
})();