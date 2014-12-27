/**
 * Created by XaeroDegreaz on 10/5/2014.
 */
var htmlRoot = $("html");
htmlRoot.attr("ng-app", "CouchtunerCompanion");
htmlRoot.attr("ng-controller", "SidebarController");
$("body").prepend(
    $("<div ng-include=\"'" + chrome.extension.getURL("html/sidebarButton.html") + "'\"/>")
);
var app = angular.module("CouchtunerCompanion", ['ui.bootstrap', 'ngAnimate', 'mgcrea.ngStrap'], function ($compileProvider, $sceDelegateProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension):|data:image\//);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
    $sceDelegateProvider.resourceUrlWhitelist(["self", "chrome-extension://**"]);
});
