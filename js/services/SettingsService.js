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
                    historySync: false
                },
                initialize: function () {
                    this.settings = SyncService.getSettings(this.settings);
                },
                save: function () {
                    SyncService.saveSettings();
                }
            };


            return serviceObject;
        }
    ]);
})();