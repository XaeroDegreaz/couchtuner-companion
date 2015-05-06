/**
 * Created by XaeroDegreaz on 10/5/2014.
 */
var htmlRoot = $("html");
htmlRoot.attr("ng-app", "CouchtunerCompanion");
htmlRoot.attr("ng-controller", "SidebarController");

var app = angular.module("CouchtunerCompanion", ['ui.bootstrap', 'ngAnimate', 'mgcrea.ngStrap', 'snap'], function ($compileProvider, $sceDelegateProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension):|data:image\//);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
    $sceDelegateProvider.resourceUrlWhitelist(["self", "chrome-extension://**"]);

    var body = $('body');
    var snapDrawer = $("<snap-drawer ng-include=\"'" + chrome.extension.getURL("html/sidebar.html") + "'\"/>");
    var sidebarButton = $("<div ng-include=\"'" + chrome.extension.getURL("html/sidebarButton.html") + "'\"/>");
    var snapContent = $('<snap-content snap-opt-touch-to-drag="false" style="background-color: #1B1B1B; box-shadow: 0 0 10px #aaa;"></snap-content>');
    var page = $("#page");
    body.prepend(snapContent);
    snapContent.prepend(page);
    snapContent.prepend(sidebarButton);
    body.prepend(snapDrawer);
});


