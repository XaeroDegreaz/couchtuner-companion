/**
 * Created by XaeroDegreaz on 10/11/2014.
 */
(function () {
    app.controller("SettingsController", [
        '$scope', 'SettingsService',
        function ($scope, SettingsService) {
            $scope.settings = SettingsService.settings;
            $scope.settingsService = SettingsService;
            $scope.haveSettingsChanged = false;

            $scope.$watchCollection('settings', function (oldValue, newValue) {
                if (oldValue === newValue) {
                    return;
                }
                SettingsService.save();
                $scope.haveSettingsChanged = true;
            });
        }
    ]);
})();