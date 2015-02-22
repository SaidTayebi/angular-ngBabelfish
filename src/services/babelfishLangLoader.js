service('babelfishLangLoader', function ($rootScope, $http, marvin, marvinI18nMemory) {

  'use strict';

  var model = marvinI18nMemory.get();

  /**
   * Lazy load translations for a lang
   * @param  {String} url
   * @param  {String} stateName
   * @return {void}
   */
  function initLazy(url, stateName) {
    var langConfig = marvin.getLazyConfigByUrl(url);

    model.available = marvin.getLazyLangAvailable();
    model.current = langConfig.lang;
    model.currentState = stateName;

    if(lazyConfig.data) {
      model.data[stateName] = lazyConfig.data;
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
    model.current = marvin.getDefaultLang();
    model.currentState = stateName;
    model.data = marvin.data;
    model.available = Object.keys(marvin.data);
  }

  /**
   * Load a translation file
   * @param  {String} url  URL for the current translation
   * @param  {String} stateName State's name
   */
  function init(url, stateName) {

    debugger;
    if(!model.data || model.data[model.current]) {
      return;
    }

    marvin.isLazy() && initLazy(url, stateName);
    marvin.data && initStaticData(url, stateName);

    setTranslation(model.currentState);
  }

  /**
   * Load a translation to the $scope
   * - doc BCP 47 {@link http://tools.ietf.org/html/bcp47}
   * - doc Value of HTML5 lang attr {@link http://webmasters.stackexchange.com/questions/28307/value-of-the-html5-lang-attribute}
   * @param {String} page State to load
   * @return {void}
   */
  function setTranslation(page) {

    page = page || model.currentState  || marvin.state;

    var lang = model.current,
        currentPageTranslation = {},
        common = {};

    // Prevent too many digest
    if(model.currentState === page && model.stateLoaded && model.current === model.previousLang) {
      return;
    }

    model.active = true;

    if(model.data[lang]) {

      /**
       * Prevent the error
       *     > TypeError: Cannot read property '$$hashKey' of undefined
       * cf {@link https://github.com/dhoko/ngBabelfish/issues/5}
       */
      if(!model.data[lang][page]) {
        model.data[lang][page] = {};

        if(marvin.isVerbose()) {
          console.warn('[babelfishLangLoader@setTranslation] No translation available for the page %s for the lang %s',page, lang);
        }
      }

      angular.extend(common, model.data[lang]._common);
      currentPageTranslation = angular.extend(common, model.data[lang][page]);

      if(marvin.getNamespace()) {
        debugger
        $rootScope[marvin.getNamespace()] = currentPageTranslation;
      }else {
        angular.extend($rootScope, currentPageTranslation);

        if(marvin.isVerbose()) {
          console.warn('[babelfishLangLoader@setTranslation] It is better to Load i18n inside a namespace.');
        }
      }

      model.stateLoaded = true;

      if(marvin.isLazy()) {
        angular.extend(common, model.data[lang]._common);
        currentPageTranslation = angular.extend(common, model.data[page]);

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

    var lang = model.current,
        currentPageTranslation = {},
        common = {};

    // Prevent too many digest
    if(lang === model.previousLang) {
      return;
    }

    model.active = true;


    if(model.data[lang]) {

      angular.extend(common, model.data._common || {});
      currentPageTranslation = angular.extend(common, model.data[lang]);

      if(marvin.getNamespace()) {
        debugger
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
    if(marvin.isLazy()) {
      url = marvin.getLazyConfig(model.current || marvin.getConfig().lang);
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
          model.data[model.current] = data;
        }else {
          model.data = data;
          model.available = Object.keys(data);
        }
      })
      .then(function() {
        if(!marvin.isSolo()) {
          setTranslation(model.currentState);
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
      model.previousLang = lang = defaultLang;
    }else {
      document.documentElement.lang = lang.split('-')[0];
      model.previousLang = defaultLang;
    }

    model.current = lang;

    $rootScope.$emit('ngBabelfish.translation:changed', {
      previous: defaultLang,
      value: lang
    });

    // Load the new language if we do not already have it
    if(marvin.isLazy() && !model.data[lang]) {
      service.load(marvin.getLazyConfig(lang).url, model.currentState);
    }
  }

  /**
   * Load some data from a cache
   * @param {Object} data
   * return {void}
   */
  function setStaticData(data) {
    if(!data[model.current]) {
      model.data[model.current] = data;
    }else {
      model.data = data;
    }
    setTranslation();
  }

  // Listen when you change the language in your application
  $rootScope.$on('ngBabelfish.translation:changed', function() {
    if(!marvin.isSolo()) {
      setTranslation(model.currentState);
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
