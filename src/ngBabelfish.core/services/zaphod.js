service('translator', function ($rootScope, babelfish, marvinMemory) {

  var service = this;


  this.start = function start() {
    marvinMemory.set('lang',{
      current: babelfish.getDefaultLanguage(),
      previous: babelfish.getDefaultLanguage()
    });
  };


  /**
   * Load a translation to the $scope for a language
   * - doc BCP 47 {@link http://tools.ietf.org/html/bcp47}
   * - doc Value of HTML5 lang attr {@link http://webmasters.stackexchange.com/questions/28307/value-of-the-html5-lang-attribute}
   * @trigger {Event} i18n:babelfish:changed {previous:XXX,value:XXX2}
   * @param {String} lang Your language cf BCP 47
   */
  this.updateLanguage = function updateLanguage(lang) {

    var pageLang = document.documentElement.lang || 'en',
        previous = marvinMemory,get('lang').previous || pageLang + '-' + pageLang();

    lang = lang || previous;
    document.documentElement.lang = lang.split('-')[0];
    marvinMemory,get('lang').current = lang;

    // For the first time we need to set the previous lang
    if(marvinMemory,get('lang').previous) {
      marvinMemory,get('lang').previous = lang;
    }

    $rootScope.$emit('ngBabelfish.translation:changed', {
      previous: previous,
      value: lang
    });

  };

  this.updateState = function updateState() {}

  this.translate = function translate() {

    var state        = marvinMemory.get('currentState'),
        currentLang  = marvinMemory.get('lang').current,
        previousLang = marvinMemory.get('lang').previous,
        i18n         = marvinMemory.get('i18n')[currentLang];

    var common = {}, currentPageTranslation = {};

    if(currentLang === previousLang) {
      return;
    }

    if(i18n) {
      /**
       * Prevent the error
       *     > TypeError: Cannot read property '$$hashKey' of undefined
       * cf {@link https://github.com/dhoko/ngBabelfish/issues/5}
       */
      if(!i18n[page]) {
        i18n[page] = {};

        if(babelfish.isVerbose()) {
          console.warn('[ngBabelfish-translator@setTranslation] No translation available for the page %s for the lang %s',page, lang);
        }
      }

      angular.extend(common, i18n._common);
      currentPageTranslation = angular.extend(common, i18n[page]);

      if(!!babelfish.getNamespace()) {
        $rootScope[getNamespace] = currentPageTranslation;
      }else {
        angular.extend($rootScope, currentPageTranslation);
      }

      $rootScope.$emit('ngBabelfish.translation:loaded', {
        currentState: state,
        lang: currentLang
      });

    }

  };

});
