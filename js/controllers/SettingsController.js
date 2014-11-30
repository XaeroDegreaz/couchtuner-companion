/**
 * Created by XaeroDegreaz on 10/11/2014.
 */
(function () {
    app.controller("SettingsController", [
        '$scope', 'SettingsService',
        function ($scope, SettingsService) {
            $scope.settings = SettingsService.settings;
            $scope.settingsService = SettingsService;

            $scope.$watchCollection('settings', function () {
                SettingsService.save();
            });
        }
    ]);
})();