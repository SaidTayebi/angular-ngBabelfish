angular.module('ngBabelfish')
  .directive('i18nBind', function ($rootScope, marvin, babelfish) {

    return {
      scope: {
        translationKey: '=i18nBind',
        translationLang: '@i18nBindLang'
      },
      template: '{{translationKey}}',
      link: function(scope, el, attr) {

        var key = '',
            namespace = marvin.getNamespace();

        key = (namespace) ? attr.i18nBind.replace(namespace + '.', '') : attr.i18nBind;

        // Because it breaks if you update translationKey...
        if(attr.i18nBindLang) {
          $rootScope.$on('ngBabelfish.lang:loaded', function (e, data) {
            if(babelfish.isLangLoaded(attr.i18nBindLang)) {
              var translation = babelfish.get(attr.i18nBindLang);
              el.text(translation[key]);
            }
          });
        }
      }
    }
  });