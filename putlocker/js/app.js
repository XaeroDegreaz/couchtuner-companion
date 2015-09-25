/**
 * Created by XaeroDegreaz on 10/5/2014.
 */
var htmlRoot = $("html");
htmlRoot.attr("ng-app", "CouchtunerCompanion");
htmlRoot.attr("ng-controller", "SidebarController");

var app = angular.module("CouchtunerCompanion", ['ui.bootstrap', 'ngAnimate', 'snap'], function ($compileProvider, $sceDelegateProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension):|data:image\//);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
    $sceDelegateProvider.resourceUrlWhitelist(["self", "chrome-extension://**"]);

    var body = $('body');
    var page = $('<div id="page"></div>');
    var snapDrawer = $("<snap-drawer><div style='height:100%;background-color: #1B1B1B' ng-include=\"'" + chrome.extension.getURL("common-html/sidebar.html") + "'\"/></snap-drawer>");
    var sidebarButton = $("<div ng-include=\"'" + chrome.extension.getURL("common-html/sidebarButton.html") + "'\"/>");
    var snapContent = $('<snap-content snap-options="snapOptions"  style="background-image: url(/images/bg.jpg)"></snap-content>');
    var p = body.contents();
    page.prepend(p);
    body.prepend(snapContent);
    snapContent.prepend(page);
    snapContent.prepend(sidebarButton);
    body.prepend(snapDrawer);
});


