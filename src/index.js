angular.module('ngBabelfish', [])
  .run(function (babelfish, $state, $rootScope) {

      // Update the translation when you change a page
      $rootScope.$on(babelfish.getEvent(), function(e, toState) {
          babelfish.updateState(toState.name);
      });
      babelfish.load();
  });
