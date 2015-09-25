/**
 * Created by XaeroDegreaz on 11/26/2014.
 */
(function () {
    app.service('SettingsService', [
        'SyncService',
        function (SyncService) {
            var serviceObject = {
                settings: {
                    bookmarkSync: false,
                    historySync: false,
                    useTvApi: false,
                    tvApiKey: null,
                    useMyjson: false
                },
                initialize: function () {
                    this.settings = SyncService.getSettings(this.settings);
                },
                save: function () {
                    SyncService.saveSettings();
                },
                getDataObject: function () {
                    return JSON.stringify(SyncService.getDataObject(), null, 2);
                },
                getMyjsonBookmarksUri: function() {
                    return SyncService.getDataObject().bookmarks_id;
                },
                getMyjsonHistoryUri: function() {
                    return SyncService.getDataObject().history_id;
                }
            };
            return serviceObject;
        }
    ]);
})();