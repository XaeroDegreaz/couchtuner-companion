/**
 * Created by XaeroDegreaz on 10/11/2014.
 */
(function () {
    app.controller("SettingsController", [
        '$scope', 'SettingsService', 'SidebarService',
        function ($scope, SettingsService, SidebarService) {
            $scope.settings = SettingsService.settings;
            $scope.settingsService = SettingsService;
            $scope.haveSettingsChanged = false;
            $scope.sidebarService = SidebarService;

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