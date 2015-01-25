service('babelfishLangLoader', function ($rootScope, $http, marvin, marvinI18nMemory) {

  'use strict';

  /**
   * Lazy load translations for a lang
   * @param  {String} url
   * @param  {String} stateName
   * @return {void}
   */
  function initLazy(url, stateName) {
    var langConfig = marvin.getLazyConfigByUrl(url);

    marvinI18nMemory.available = marvin.getLazyLangAvailable();
    marvinI18nMemory.current = langConfig.lang;
    marvinI18nMemory.currentState = stateName;

    if(lazyConfig.data) {
      marvinI18nMemory.data[stateName] = lazyConfig.data;
    }

  }

  /**
   * Load a translation for a current state from static data
   * For each lang and state you can use the key data in order to load these data
   * @param  {String} url
   * @param  {String} stateName
   * @return {void}
   */
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

      marvinI18nMemory.stateLoaded = true;

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

  /**
   * Load a translation for a state
   * @param  {String} url
   * @param  {String} stateName
   * @return {$q.Promise}
   */
  function load(url, stateName) {

    url = url || marvin.getConfig().url;
    stateName = stateName || marvin.getConfig().state;

    if(config.isLazy()) {
      url = marvin.getLazyConfig(marvinI18nMemory.current || marvin.getConfig().lang);
    }

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

  /**
   * Load a translation to the $scope for a language
   * - doc BCP 47 {@link http://tools.ietf.org/html/bcp47}
   * - doc Value of HTML5 lang attr {@link http://webmasters.stackexchange.com/questions/28307/value-of-the-html5-lang-attribute}
   * @trigger {Event} i18n:babelfish:changed {previous:XXX,value:XXX2}
   * @param {String} lang Your language cf BCP 47
   */
  function loadLanguage(lang) {

    var defaultLang = marvin.getDefaultLang();

    // Find the current lang if it doesn't exist. Store the previous one too
    if(!lang) {
      marvinI18nMemory.previousLang = lang = defaultLang;
    }else {
      document.documentElement.lang = lang.split('-')[0];
      marvinI18nMemory.previousLang = defaultLang;
    }

    marvinI18nMemory.current = lang;

    $rootScope.$emit('ngBabelfish.translation:changed', {
      previous: defaultLang,
      value: lang
    });

    // Load the new language if we do not already have it
    if(marvin.isLazy() && !marvinI18nMemory.data[lang]) {
      service.load(marvin.getLazyConfig(lang).url, marvinI18nMemory.currentState);
    }
  }

  /**
   * Load some data from a cache
   * @param {Object} data
   * return {void}
   */
  function setStaticData(data) {
    if(!data[marvinI18nMemory.current]) {
      marvinI18nMemory.data[marvinI18nMemory.current] = data;
    }else {
      marvinI18nMemory.data = data;
    }
    setTranslation();
  }

  // Listen when you change the language in your application
  $rootScope.$on('ngBabelfish.translation:changed', function() {
    if(!marvin.isSolo()) {
      setTranslation(marvinI18nMemory.currentState);
    }else{
      setSoloTranslation();
    }
  });

  return {
    init: init,
    initLazy: initLazy,
    initStaticData: initStaticData,
    updateState: setTranslation,
    setSoloTranslation: setSoloTranslation,
    setStaticData: setStaticData,
    load: load,
    updateLang: loadLanguage
  };

});