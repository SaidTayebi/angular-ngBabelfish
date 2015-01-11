angular.module('ngBabelfish', [])
  .run(function ($state, $rootScope, babelfishLangLoader, marvin) {

    // Update the translation when you change a page
    $rootScope.$on(marvin.getRouteEvent(), function (e, toState) {
      babelfishLangLoader.updateState(toState.name);
    });
    babelfishLangLoader.load();
  });
