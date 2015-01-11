service('babelfishLangLoader', function ($rootScope, $http, marvin, marvinI18nMemory) {

  'use strict';

  function initLazy(url, stateName) {
    var langConfig = marvin.getLazyConfigByUrl(url);

    marvinI18nMemory.available = marvin.getLazyLangAvailable();
    marvinI18nMemory.current = langConfig.lang;
    marvinI18nMemory.currentState = stateName;

    if(lazyConfig.data) {
      marvinI18nMemory.data[stateName] = lazyConfig.data;
    }

  }

  function initStaticData(url, stateName) {
    marvinI18nMemory.current = marvin.getDefaultLang();
    marvinI18nMemory.currentState = stateName;
    marvinI18nMemory.data = marvin.data;
    marvinI18nMemory.available = Object.keys(marvin.data);
  }

  /**
   * Load a translation file
   * @param  {String} url  URL for the current translation
   * @param  {String} stateName State's name
   */
  function init(url, stateName) {

    if(marvinI18nMemory.data[marvinI18nMemory.current]) {
      return;
    }

    marvin.isLazy() && initLazy(url, stateName);
    marvin.data && initStaticData(url, stateName);

    setTranslation(marvinI18nMemory.currentState);
  }

  /**
   * Load a translation to the $scope
   * - doc BCP 47 {@link http://tools.ietf.org/html/bcp47}
   * - doc Value of HTML5 lang attr {@link http://webmasters.stackexchange.com/questions/28307/value-of-the-html5-lang-attribute}
   * @param {String} page State to load
   * @return {void}
   */
  function setTranslation(page) {

    page = page || marvinI18nMemory.currentState  || marvin.state;

    var lang = marvinI18nMemory.current,
        currentPageTranslation = {},
        common = {};

    // Prevent too many digest
    if(marvinI18nMemory.currentState === page && marvinI18nMemory.stateLoaded && marvinI18nMemory.current === marvinI18nMemory.previousLang) {
      return;
    }

    marvinI18nMemory.active = true;

    if(marvinI18nMemory.data[lang]) {

      /**
       * Prevent the error
       *     > TypeError: Cannot read property '$$hashKey' of undefined
       * cf {@link https://github.com/dhoko/ngBabelfish/issues/5}
       */
      if(!marvinI18nMemory.data[lang][page]) {
        marvinI18nMemory.data[lang][page] = {};

        if(marvin.isVerbose()) {
          console.warn('[babelfishLangLoader@setTranslation] No translation available for the page %s for the lang %s',page, lang);
        }
      }

      angular.extend(common, marvinI18nMemory.data[lang]._common);
      currentPageTranslation = angular.extend(common, marvinI18nMemory.data[lang][page]);

      if(marvin.getNamespace()) {
        $rootScope[marvin.getNamespace()] = currentPageTranslation;
      }else {
        angular.extend($rootScope, currentPageTranslation);

        if(marvin.isVerbose()) {
          console.warn('[babelfishLangLoader@setTranslation] It is better to Load i18n inside a namespace.');
        }
      }

      if(marvin.isLazy()) {
        angular.extend(common, marvinI18nMemory.data[lang]._common);
        currentPageTranslation = angular.extend(common, marvinI18nMemory.data[page]);

        if(config.namespace) {
          $rootScope[config.namespace] = currentPageTranslation;
        }else {
          angular.extend($rootScope, currentPageTranslation);
        }
      }

      $rootScope.$emit('ngBabelfish.translation:loaded', {
        currentState: page,
        lang: lang
      });
    }

  }

  /**
   * Load a translation to the $scope
   * - doc BCP 47 {@link http://tools.ietf.org/html/bcp47}
   * - doc Value of HTML5 lang attr {@link http://webmasters.stackexchange.com/questions/28307/value-of-the-html5-lang-attribute}
   * @param {String} lang Your language cf BCP 47
   */
  function setSoloTranslation() {

    var lang = marvinI18nMemory.current,
        currentPageTranslation = {},
        common = {};

    // Prevent too many digest
    if(lang === marvinI18nMemory.previousLang) {
      return;
    }

    marvinI18nMemory.active = true;


    if(marvinI18nMemory.data[lang]) {

      angular.extend(common, marvinI18nMemory.data._common || {});
      currentPageTranslation = angular.extend(common, marvinI18nMemory.data[lang]);

      if(marvin.getNamespace()) {
        $rootScope[marvin.getNamespace()] = currentPageTranslation;
      }else {
        angular.extend($rootScope, currentPageTranslation);

        if(marvin.isVerbose()) {
          console.warn('[babelfishLangLoader@setSoloTranslation] It is better to Load i18n inside a namespace.');
        }
      }

      $rootScope.$emit('ngBabelfish.translation:loaded', {
        lang: lang
      });
    }
  }

  function load(url, stateName) {

    init(url, stateName);

    return $http.get(url)
      .error(function() {
        if(marvin.isVerbose()) {
          throw new Error('[babelfishLangLoader@load] Cannot load the translation file');
        }
      })
      .success(function (data) {

        if(marvin.isLazy()) {
          marvinI18nMemory.data[marvinI18nMemory.current] = data;
        }else {
          marvinI18nMemory.data = data;
          marvinI18nMemory.available = Object.keys(i18n.data);
        }

      })
      .then(function() {

          if(!marvin.isSolo()) {
            setTranslation(marvinI18nMemory.currentState);
          }else{
            setSoloTranslation();
          }
      });
  }

  return {
    init: init,
    initLazy: initLazy,
    initStaticData: initStaticData,
    setTranslation: setTranslation,
    setSoloTranslation: setSoloTranslation,
    load: load
  };

});