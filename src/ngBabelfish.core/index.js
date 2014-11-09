/**
 * I18n module
 * Translate your application
 */
angular.module('ngBabelfish', ['ngBabelfish.core','ngBabelfish.directives','ngBabelfish.filters'])
  .run(function ($rootScope, translator) {
    // Update the translation when you change a page
    $rootScope.$on(babelfish.getEventName(), function (e, toState) {
        translator.updateState(toState.name);
    });
    translator.start();
  });
