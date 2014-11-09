/**
 * I18n module
 * Translate your application
 */
angular.module('ngBabelfish', ['ngBabelfish.core','ngBabelfish.directives','ngBabelfish.filters'])
  .run(function (babelfish, $rootScope) {
    // Update the translation when you change a page
    $rootScope.$on(babelfish.getEvent(), function (e, toState) {
        babelfish.updateState(toState.name);
    });
    babelfish.load();
  });
