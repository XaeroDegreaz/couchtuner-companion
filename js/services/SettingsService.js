/**
 * Created by XaeroDegreaz on 11/26/2014.
 */
(function () {
    app.service('SettingsService', [
        'SyncService',
        function (SyncService) {
            return {
                settings: {
                    bookmarkSync: false,
                    historySync: false
                },
                initialize: function () {
                    var settings = SyncService.getSettings();
                    this.settings = (settings.length > 0) ? settings : this.settings;
                }
            }
        }
    ]);
})();