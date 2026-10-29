import angular from 'angular';
import 'hammerjs';
import 'angular-hammer';
import 'angularjs-gauge';
import 'angular-moment';
import 'angular-dynamic-locale';
import './vendors/color-picker';
import { App } from './app';

// Initializes angular app manually. This is triggered from the onload event of the config.js script.
// @ts-ignore
window.initApp = function () {
   angular.element(function () {
      angular.bootstrap(document, [App.name]);
   });

   App.config(function ($compileProvider, $sceProvider, $locationProvider, ApiProvider, tmhDynamicLocaleProvider) {
      // Skips attaching scope/binding metadata to every DOM node. Nothing here uses element.scope().
      $compileProvider.debugInfoEnabled(false);

      $sceProvider.enabled(false);

      $locationProvider.html5Mode({
         enabled: true,
         requireBase: false,
      });

      if (!window.CONFIG) {
         return;
      }

      ApiProvider.setInitOptions({
         wsUrl: window.WS_URL_OVERRIDE || window.CONFIG.wsUrl,
         authToken: window.AUTH_TOKEN_OVERRIDE || window.CONFIG.authToken,
      });

      tmhDynamicLocaleProvider.localeLocationPattern('./locales/{{locale}}.js');
   });
};
