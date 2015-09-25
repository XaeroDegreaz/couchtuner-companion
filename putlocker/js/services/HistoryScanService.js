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

        function getNiceNumber(number) {
            number = parseInt(number);
            var niceNumber = (number >= 0 && number < 10) ? "0" + number : number;
            return niceNumber;
        }

        function getNiceName (string) {
            var regex = /(.+>)?([\w '.,"]+)(.+)(S)(eason)?(\D+)?(\d+)(.+)?([eE])(pisode)?(\D+)?(\d+)/;
            var groups = regex.exec(string);
            var showName = groups[2];
            var season = getNiceNumber(groups[7]);
            var episode = getNiceNumber(groups[12]);

            return showName + " - S" + season + "E" + episode;
        }

        return{
            initialize: function () {
                parseHistoryTrackableLinks();
            },
            getNiceName: function (string) {
                return getNiceName(string);
            }
        }
    }]);
})();