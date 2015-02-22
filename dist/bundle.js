angular.module('ngBabelfish', [])
  .run(['$rootScope', 'babelfishLangLoader', 'marvin', function ($rootScope, babelfishLangLoader, marvin) {

    // Update the translation when you change a page
    $rootScope.$on(marvin.getRouteEvent(), function (e, toState) {
      babelfishLangLoader.updateState(toState.name);
    });
    babelfishLangLoader.load();
  }]);
angular.module('ngBabelfish')
	./**
 * i18nBind directive
 * Load a translation for a var
 *
 * If you do not provide any lang (i18n-bind-lang), we will compile the directive, else it will update the textContent.
 *
 * We do not update the translationKey's value because it will change the reference key from i18n-bind. Yup that's weird.
 *
 * Isolate scope FTW
 */
directive('i18nBind', function () {

    // 'use strict';


    return {
        restrict: "A",
        scope: {
            translationKey: "=i18nBind",
            translationLang: "@i18nBindLang"
        },
        template: "{{translationKey}}",

        link: function(scope,el,attr) {

            // var key = '',
            //     namespace = translator.getNamespace();

            // key = (namespace) ? attr.i18nBind.replace(namespace + '.', '') : attr.i18nBind;

            // // Because it breaks if you update translationKey...
            // if(attr.i18nBindLang) {

            //     if(!translator.isLangLoaded(attr.i18nBindLang)) {
            //         translator.loadTranslation(attr.i18nBindLang)
            //             .then(function() {
            //                 el.text(translator.get(attr.i18nBindLang || translator.current())[key]);
            //             });
            //     }else{
            //         el.text(translator.get(attr.i18nBindLang || translator.current())[key]);
            //     }

            // }

        }
    };

});
angular.module('ngBabelfish')
	./**
 * i18nLoad directive
 * Load a translation from a click on a button with the attr i18n-load
 */
directive('i18nLoad', function() {

    // "use strict";

    return {
        restrict: "A",
        link: function(scope,el,attr) {
            el.on('click',function() {
                scope.$apply(function() {
                    translator.updateLang(attr.i18nLoad);
                });
            });
        }
    };

});
angular.module('ngBabelfish')
	.factory('marvinI18nMemory', function() {
  var memory = {
    current: '',
    data: null,
    available: [],
    currentState: '',
    active: false,
    previousLang: 'en-EN',
    stateLoaded: false
  };

  return {
    get: function() {
      return memory;
    }
  };
});angular.module('ngBabelfish')
	.filter('babelfish', function (babelfish) {
  /**
   * transalte filter
   * Translate a string to another language
   * {{ name | translate:'fr-FR':"name"}}
   */
  'use strict';

  return function (input, lang, key) {
    return babelfish.get(lang)[key];
  }
});
angular.module('ngBabelfish')
	.provider('marvin', function() {

  'use strict';

  /**
   * Default configuration for the module
   * @type {Object}
   */
  var config = {
      state: 'home',
      lang: 'en-EN',
      url: '/i18n/languages.json',
      routeEventName: '$stateChangeSuccess',
      namespace: 'i18n',
      lazy: false,
      lazyConfig: [],
      current: '',
      log: true
  };

  /**
   * Configure the service with a provider from the config of your module
   * @param  {Object} params Configuration object
   * @return {void}
   */
  this.init = function initBabelfishConfig(params) {
    angular.extend(config, params);
  };

  /**
   * Add each language for your application
   * @param  {Object} opt {lang: "",url: ""}
   * @return {babelfishProvider}
   */
  this.lang = function lang(opt) {

    if(!opt.lang) {
      throw new Error('[babelfishProvider@lang] You must set the key lang');
    }

    if(!opt.url) {
      throw new Error('[babelfishProvider@lang] You must set the key url');
    }

    config.lazy = true;
    config.urls.push(opt);
    return this;
  };

  /**
   * Marvin service
   */
  this.$get = function($document) {
    return {

      /**
       * Return babelfish configuration
       * @return {Object}
       */
      getConfig: function getConfig() {
        return config;
      },

      /**
       * Return the default event name in order to listen a new state||route
       * @return {String}
       */
      getRouteEvent: function getRouteEvent() {
        return config.routeEventName;
      },

      /**
       * Get the namespace of the application
       * @return {String}
       */
      getNamespace: function getNamespace() {
        return config.namespace;
      },

      /**
       * Get the lang for your app.
       * - You can use the provider
       * - You can use html default attr
       * @return {String}
       */
      getDefaultLang: function getDefaultLang() {

        if(config.lang) {
          $document.documentElement.lang = config.lang.split('-')[0];
          return config.lang;
        }

        return $document.documentElement.lang + '-' + $document.documentElement.lang.toUpperCase();
      },

      getLazyLangAvailable: function getLazyLangAvailable() {
        return config.lazyConfig.map(function (item) {
          return item.lang;
        });
      },

      /**
       * Get the lazy configuration for any lang
       * - Default is the config lang
       * @param  {String} langKey
       * @return {Objet}
       */
      getLazyConfig: function getLazyConfig(langKey) {

        var langToFind = langKey || this.getDefaultLang();
        return config.urls.filter(function (o) {
          return o.lang === langToFind;
        })[0] || {};
      },

      getLazyConfigByUrl: function getLazyConfigByUrl(url) {
        return config.urls.filter(function (o) {
          return o === url;
        })[0];
      },

      isVerbose: function isVerbose() {
        return config.log;
      },

      /**
       * Should we use the lazy mode for the application
       * @return {Boolean}
       */
      isLazy: function isLazy() {
        return config.lazy;
      },

      isSolo: function isSolo() {
        console.log('[@todo] Need to implement solo mode');
        return false;
      }
    };
  };

});
angular.module('ngBabelfish')
	.service('babelfish', function (marvin, marvinI18nMemory) {
  'use strict';

  /**
   * Return the current state translation
   * @param  {String} lang
   * @return {Object}
   */
  function get(lang) {
    var currentLang = marvinI18nMemory.data[lang || marvinI18nMemory.current] || {},
        common = {};


    if(marvin.isSolo()) {
      return angular.extend({}, marvinI18nMemory.data._common || {}, currentLang);
    }


    if(!currentLang[marvinI18nMemory.currentState]) {

      if(marvin.isVerbose()) {
        console.warn('[ngBabelfish-translator@get] No translation available for the page %s for the  lang %s',marvinI18nMemory.currentState, (lang || marvinI18nMemory.current));
      }
      currentLang[marvinI18nMemory.currentState] = {};
    }

    angular.extend(common, {}, currentLang._common);
    return angular.extend(common, currentLang[marvinI18nMemory.currentState]);
  }

  /**
   * Get all translations available for a lang
   * @param  {String} lang
   * @return {Object}
   */
  function all(lang) {

    var langId = lang || marvinI18nMemory.current;

    if(marvin.isSolo()) {
      return angular.extend({}, marvinI18nMemory.data._common || {}, marvinI18nMemory.data[langId] || {});
    }

    return marvinI18nMemory.data[langId];
  }

  /**
   * Return each translations available for your app
   * @return {Object}
   */
  function translations() {
    return marvinI18nMemory.data;
  }

  /**
   * Check if you already load this lang
   * @param  {String}  lang
   * @return {Boolean}
   */
  function isLangLoaded(lang) {
      return !!marvinI18nMemory.data[lang];
  }

  /**
   * Get the current Language
   * @return {String} lang
   */
  function current() {
    return marvinI18nMemory.current;
  }

  /**
   * Check if we have loaded i18n
   * @return {Boolean}
   */
  function isLoaded() {
    return marvinI18nMemory.active;
  }

  /**
   * List each language available in babelfish
   * With the solo mode you can use a key _comom to share between each lang a trad. So we cannot return it.
   * @return {Array}
   */
  function getLanguages() {
    if(marvinI18nMemory.available.indexOf('_comon') > -1) {
      marvinI18nMemory.available.splice(marvinI18nMemory.available.indexOf('_comon'),1);
    }
    return marvinI18nMemory.available;
  }


  return {
    get: get,
    all: all,
    current: current,
    translations: translations,
    languages: getLanguages,
    isLangLoaded: isLangLoaded,
    isLoaded: isLoaded
  };
});angular.module('ngBabelfish')
	.service('babelfishLangLoader', function ($rootScope, $http, marvin, marvinI18nMemory) {

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiZGlyZWN0aXZlcy9pMThuQmluZC5qcyIsImRpcmVjdGl2ZXMvaTE4bkxvYWQuanMiLCJmYWN0b3J5L21hcnZpbkkxOG5NZW1vcnkuanMiLCJmaWx0ZXJzL3RyYW5zbGF0ZS5qcyIsInByb3ZpZGVycy9tYXJ2aW4uanMiLCJzZXJ2aWNlcy9iYWJlbGZpc2guanMiLCJzZXJ2aWNlcy9iYWJlbGZpc2hMYW5nTG9hZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCduZ0JhYmVsZmlzaCcsIFtdKVxuICAucnVuKFsnJHJvb3RTY29wZScsICdiYWJlbGZpc2hMYW5nTG9hZGVyJywgJ21hcnZpbicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBiYWJlbGZpc2hMYW5nTG9hZGVyLCBtYXJ2aW4pIHtcblxuICAgIC8vIFVwZGF0ZSB0aGUgdHJhbnNsYXRpb24gd2hlbiB5b3UgY2hhbmdlIGEgcGFnZVxuICAgICRyb290U2NvcGUuJG9uKG1hcnZpbi5nZXRSb3V0ZUV2ZW50KCksIGZ1bmN0aW9uIChlLCB0b1N0YXRlKSB7XG4gICAgICBiYWJlbGZpc2hMYW5nTG9hZGVyLnVwZGF0ZVN0YXRlKHRvU3RhdGUubmFtZSk7XG4gICAgfSk7XG4gICAgYmFiZWxmaXNoTGFuZ0xvYWRlci5sb2FkKCk7XG4gIH1dKTtcbiIsIi8qKlxuICogaTE4bkJpbmQgZGlyZWN0aXZlXG4gKiBMb2FkIGEgdHJhbnNsYXRpb24gZm9yIGEgdmFyXG4gKlxuICogSWYgeW91IGRvIG5vdCBwcm92aWRlIGFueSBsYW5nIChpMThuLWJpbmQtbGFuZyksIHdlIHdpbGwgY29tcGlsZSB0aGUgZGlyZWN0aXZlLCBlbHNlIGl0IHdpbGwgdXBkYXRlIHRoZSB0ZXh0Q29udGVudC5cbiAqXG4gKiBXZSBkbyBub3QgdXBkYXRlIHRoZSB0cmFuc2xhdGlvbktleSdzIHZhbHVlIGJlY2F1c2UgaXQgd2lsbCBjaGFuZ2UgdGhlIHJlZmVyZW5jZSBrZXkgZnJvbSBpMThuLWJpbmQuIFl1cCB0aGF0J3Mgd2VpcmQuXG4gKlxuICogSXNvbGF0ZSBzY29wZSBGVFdcbiAqL1xuZGlyZWN0aXZlKCdpMThuQmluZCcsIGZ1bmN0aW9uICgpIHtcblxuICAgIC8vICd1c2Ugc3RyaWN0JztcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6IFwiQVwiLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgdHJhbnNsYXRpb25LZXk6IFwiPWkxOG5CaW5kXCIsXG4gICAgICAgICAgICB0cmFuc2xhdGlvbkxhbmc6IFwiQGkxOG5CaW5kTGFuZ1wiXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlOiBcInt7dHJhbnNsYXRpb25LZXl9fVwiLFxuXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLGVsLGF0dHIpIHtcblxuICAgICAgICAgICAgLy8gdmFyIGtleSA9ICcnLFxuICAgICAgICAgICAgLy8gICAgIG5hbWVzcGFjZSA9IHRyYW5zbGF0b3IuZ2V0TmFtZXNwYWNlKCk7XG5cbiAgICAgICAgICAgIC8vIGtleSA9IChuYW1lc3BhY2UpID8gYXR0ci5pMThuQmluZC5yZXBsYWNlKG5hbWVzcGFjZSArICcuJywgJycpIDogYXR0ci5pMThuQmluZDtcblxuICAgICAgICAgICAgLy8gLy8gQmVjYXVzZSBpdCBicmVha3MgaWYgeW91IHVwZGF0ZSB0cmFuc2xhdGlvbktleS4uLlxuICAgICAgICAgICAgLy8gaWYoYXR0ci5pMThuQmluZExhbmcpIHtcblxuICAgICAgICAgICAgLy8gICAgIGlmKCF0cmFuc2xhdG9yLmlzTGFuZ0xvYWRlZChhdHRyLmkxOG5CaW5kTGFuZykpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgdHJhbnNsYXRvci5sb2FkVHJhbnNsYXRpb24oYXR0ci5pMThuQmluZExhbmcpXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICBlbC50ZXh0KHRyYW5zbGF0b3IuZ2V0KGF0dHIuaTE4bkJpbmRMYW5nIHx8IHRyYW5zbGF0b3IuY3VycmVudCgpKVtrZXldKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gICAgIH1lbHNle1xuICAgICAgICAgICAgLy8gICAgICAgICBlbC50ZXh0KHRyYW5zbGF0b3IuZ2V0KGF0dHIuaTE4bkJpbmRMYW5nIHx8IHRyYW5zbGF0b3IuY3VycmVudCgpKVtrZXldKTtcbiAgICAgICAgICAgIC8vICAgICB9XG5cbiAgICAgICAgICAgIC8vIH1cblxuICAgICAgICB9XG4gICAgfTtcblxufSk7XG4iLCIvKipcbiAqIGkxOG5Mb2FkIGRpcmVjdGl2ZVxuICogTG9hZCBhIHRyYW5zbGF0aW9uIGZyb20gYSBjbGljayBvbiBhIGJ1dHRvbiB3aXRoIHRoZSBhdHRyIGkxOG4tbG9hZFxuICovXG5kaXJlY3RpdmUoJ2kxOG5Mb2FkJywgZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiBcIkFcIixcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsZWwsYXR0cikge1xuICAgICAgICAgICAgZWwub24oJ2NsaWNrJyxmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0b3IudXBkYXRlTGFuZyhhdHRyLmkxOG5Mb2FkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7XG4iLCJmYWN0b3J5KCdtYXJ2aW5JMThuTWVtb3J5JywgZnVuY3Rpb24oKSB7XG4gIHZhciBtZW1vcnkgPSB7XG4gICAgY3VycmVudDogJycsXG4gICAgZGF0YTogbnVsbCxcbiAgICBhdmFpbGFibGU6IFtdLFxuICAgIGN1cnJlbnRTdGF0ZTogJycsXG4gICAgYWN0aXZlOiBmYWxzZSxcbiAgICBwcmV2aW91c0xhbmc6ICdlbi1FTicsXG4gICAgc3RhdGVMb2FkZWQ6IGZhbHNlXG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG1lbW9yeTtcbiAgICB9XG4gIH07XG59KTsiLCJmaWx0ZXIoJ2JhYmVsZmlzaCcsIGZ1bmN0aW9uIChiYWJlbGZpc2gpIHtcbiAgLyoqXG4gICAqIHRyYW5zYWx0ZSBmaWx0ZXJcbiAgICogVHJhbnNsYXRlIGEgc3RyaW5nIHRvIGFub3RoZXIgbGFuZ3VhZ2VcbiAgICoge3sgbmFtZSB8IHRyYW5zbGF0ZTonZnItRlInOlwibmFtZVwifX1cbiAgICovXG4gICd1c2Ugc3RyaWN0JztcblxuICByZXR1cm4gZnVuY3Rpb24gKGlucHV0LCBsYW5nLCBrZXkpIHtcbiAgICByZXR1cm4gYmFiZWxmaXNoLmdldChsYW5nKVtrZXldO1xuICB9XG59KTtcbiIsInByb3ZpZGVyKCdtYXJ2aW4nLCBmdW5jdGlvbigpIHtcblxuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgY29uZmlndXJhdGlvbiBmb3IgdGhlIG1vZHVsZVxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgdmFyIGNvbmZpZyA9IHtcbiAgICAgIHN0YXRlOiAnaG9tZScsXG4gICAgICBsYW5nOiAnZW4tRU4nLFxuICAgICAgdXJsOiAnL2kxOG4vbGFuZ3VhZ2VzLmpzb24nLFxuICAgICAgcm91dGVFdmVudE5hbWU6ICckc3RhdGVDaGFuZ2VTdWNjZXNzJyxcbiAgICAgIG5hbWVzcGFjZTogJ2kxOG4nLFxuICAgICAgbGF6eTogZmFsc2UsXG4gICAgICBsYXp5Q29uZmlnOiBbXSxcbiAgICAgIGN1cnJlbnQ6ICcnLFxuICAgICAgbG9nOiB0cnVlXG4gIH07XG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZSB0aGUgc2VydmljZSB3aXRoIGEgcHJvdmlkZXIgZnJvbSB0aGUgY29uZmlnIG9mIHlvdXIgbW9kdWxlXG4gICAqIEBwYXJhbSAge09iamVjdH0gcGFyYW1zIENvbmZpZ3VyYXRpb24gb2JqZWN0XG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqL1xuICB0aGlzLmluaXQgPSBmdW5jdGlvbiBpbml0QmFiZWxmaXNoQ29uZmlnKHBhcmFtcykge1xuICAgIGFuZ3VsYXIuZXh0ZW5kKGNvbmZpZywgcGFyYW1zKTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIGVhY2ggbGFuZ3VhZ2UgZm9yIHlvdXIgYXBwbGljYXRpb25cbiAgICogQHBhcmFtICB7T2JqZWN0fSBvcHQge2xhbmc6IFwiXCIsdXJsOiBcIlwifVxuICAgKiBAcmV0dXJuIHtiYWJlbGZpc2hQcm92aWRlcn1cbiAgICovXG4gIHRoaXMubGFuZyA9IGZ1bmN0aW9uIGxhbmcob3B0KSB7XG5cbiAgICBpZighb3B0LmxhbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignW2JhYmVsZmlzaFByb3ZpZGVyQGxhbmddIFlvdSBtdXN0IHNldCB0aGUga2V5IGxhbmcnKTtcbiAgICB9XG5cbiAgICBpZighb3B0LnVybCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdbYmFiZWxmaXNoUHJvdmlkZXJAbGFuZ10gWW91IG11c3Qgc2V0IHRoZSBrZXkgdXJsJyk7XG4gICAgfVxuXG4gICAgY29uZmlnLmxhenkgPSB0cnVlO1xuICAgIGNvbmZpZy51cmxzLnB1c2gob3B0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogTWFydmluIHNlcnZpY2VcbiAgICovXG4gIHRoaXMuJGdldCA9IGZ1bmN0aW9uKCRkb2N1bWVudCkge1xuICAgIHJldHVybiB7XG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJuIGJhYmVsZmlzaCBjb25maWd1cmF0aW9uXG4gICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgKi9cbiAgICAgIGdldENvbmZpZzogZnVuY3Rpb24gZ2V0Q29uZmlnKCkge1xuICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBSZXR1cm4gdGhlIGRlZmF1bHQgZXZlbnQgbmFtZSBpbiBvcmRlciB0byBsaXN0ZW4gYSBuZXcgc3RhdGV8fHJvdXRlXG4gICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgKi9cbiAgICAgIGdldFJvdXRlRXZlbnQ6IGZ1bmN0aW9uIGdldFJvdXRlRXZlbnQoKSB7XG4gICAgICAgIHJldHVybiBjb25maWcucm91dGVFdmVudE5hbWU7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEdldCB0aGUgbmFtZXNwYWNlIG9mIHRoZSBhcHBsaWNhdGlvblxuICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICovXG4gICAgICBnZXROYW1lc3BhY2U6IGZ1bmN0aW9uIGdldE5hbWVzcGFjZSgpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5uYW1lc3BhY2U7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEdldCB0aGUgbGFuZyBmb3IgeW91ciBhcHAuXG4gICAgICAgKiAtIFlvdSBjYW4gdXNlIHRoZSBwcm92aWRlclxuICAgICAgICogLSBZb3UgY2FuIHVzZSBodG1sIGRlZmF1bHQgYXR0clxuICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICovXG4gICAgICBnZXREZWZhdWx0TGFuZzogZnVuY3Rpb24gZ2V0RGVmYXVsdExhbmcoKSB7XG5cbiAgICAgICAgaWYoY29uZmlnLmxhbmcpIHtcbiAgICAgICAgICAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcgPSBjb25maWcubGFuZy5zcGxpdCgnLScpWzBdO1xuICAgICAgICAgIHJldHVybiBjb25maWcubGFuZztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcgKyAnLScgKyAkZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcudG9VcHBlckNhc2UoKTtcbiAgICAgIH0sXG5cbiAgICAgIGdldExhenlMYW5nQXZhaWxhYmxlOiBmdW5jdGlvbiBnZXRMYXp5TGFuZ0F2YWlsYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5sYXp5Q29uZmlnLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgIHJldHVybiBpdGVtLmxhbmc7XG4gICAgICAgIH0pO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBHZXQgdGhlIGxhenkgY29uZmlndXJhdGlvbiBmb3IgYW55IGxhbmdcbiAgICAgICAqIC0gRGVmYXVsdCBpcyB0aGUgY29uZmlnIGxhbmdcbiAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gbGFuZ0tleVxuICAgICAgICogQHJldHVybiB7T2JqZXR9XG4gICAgICAgKi9cbiAgICAgIGdldExhenlDb25maWc6IGZ1bmN0aW9uIGdldExhenlDb25maWcobGFuZ0tleSkge1xuXG4gICAgICAgIHZhciBsYW5nVG9GaW5kID0gbGFuZ0tleSB8fCB0aGlzLmdldERlZmF1bHRMYW5nKCk7XG4gICAgICAgIHJldHVybiBjb25maWcudXJscy5maWx0ZXIoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICByZXR1cm4gby5sYW5nID09PSBsYW5nVG9GaW5kO1xuICAgICAgICB9KVswXSB8fCB7fTtcbiAgICAgIH0sXG5cbiAgICAgIGdldExhenlDb25maWdCeVVybDogZnVuY3Rpb24gZ2V0TGF6eUNvbmZpZ0J5VXJsKHVybCkge1xuICAgICAgICByZXR1cm4gY29uZmlnLnVybHMuZmlsdGVyKGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgcmV0dXJuIG8gPT09IHVybDtcbiAgICAgICAgfSlbMF07XG4gICAgICB9LFxuXG4gICAgICBpc1ZlcmJvc2U6IGZ1bmN0aW9uIGlzVmVyYm9zZSgpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5sb2c7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIFNob3VsZCB3ZSB1c2UgdGhlIGxhenkgbW9kZSBmb3IgdGhlIGFwcGxpY2F0aW9uXG4gICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICovXG4gICAgICBpc0xhenk6IGZ1bmN0aW9uIGlzTGF6eSgpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5sYXp5O1xuICAgICAgfSxcblxuICAgICAgaXNTb2xvOiBmdW5jdGlvbiBpc1NvbG8oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbQHRvZG9dIE5lZWQgdG8gaW1wbGVtZW50IHNvbG8gbW9kZScpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxufSk7XG4iLCJzZXJ2aWNlKCdiYWJlbGZpc2gnLCBmdW5jdGlvbiAobWFydmluLCBtYXJ2aW5JMThuTWVtb3J5KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBjdXJyZW50IHN0YXRlIHRyYW5zbGF0aW9uXG4gICAqIEBwYXJhbSAge1N0cmluZ30gbGFuZ1xuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuICBmdW5jdGlvbiBnZXQobGFuZykge1xuICAgIHZhciBjdXJyZW50TGFuZyA9IG1hcnZpbkkxOG5NZW1vcnkuZGF0YVtsYW5nIHx8IG1hcnZpbkkxOG5NZW1vcnkuY3VycmVudF0gfHwge30sXG4gICAgICAgIGNvbW1vbiA9IHt9O1xuXG5cbiAgICBpZihtYXJ2aW4uaXNTb2xvKCkpIHtcbiAgICAgIHJldHVybiBhbmd1bGFyLmV4dGVuZCh7fSwgbWFydmluSTE4bk1lbW9yeS5kYXRhLl9jb21tb24gfHwge30sIGN1cnJlbnRMYW5nKTtcbiAgICB9XG5cblxuICAgIGlmKCFjdXJyZW50TGFuZ1ttYXJ2aW5JMThuTWVtb3J5LmN1cnJlbnRTdGF0ZV0pIHtcblxuICAgICAgaWYobWFydmluLmlzVmVyYm9zZSgpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW25nQmFiZWxmaXNoLXRyYW5zbGF0b3JAZ2V0XSBObyB0cmFuc2xhdGlvbiBhdmFpbGFibGUgZm9yIHRoZSBwYWdlICVzIGZvciB0aGUgIGxhbmcgJXMnLG1hcnZpbkkxOG5NZW1vcnkuY3VycmVudFN0YXRlLCAobGFuZyB8fCBtYXJ2aW5JMThuTWVtb3J5LmN1cnJlbnQpKTtcbiAgICAgIH1cbiAgICAgIGN1cnJlbnRMYW5nW21hcnZpbkkxOG5NZW1vcnkuY3VycmVudFN0YXRlXSA9IHt9O1xuICAgIH1cblxuICAgIGFuZ3VsYXIuZXh0ZW5kKGNvbW1vbiwge30sIGN1cnJlbnRMYW5nLl9jb21tb24pO1xuICAgIHJldHVybiBhbmd1bGFyLmV4dGVuZChjb21tb24sIGN1cnJlbnRMYW5nW21hcnZpbkkxOG5NZW1vcnkuY3VycmVudFN0YXRlXSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCB0cmFuc2xhdGlvbnMgYXZhaWxhYmxlIGZvciBhIGxhbmdcbiAgICogQHBhcmFtICB7U3RyaW5nfSBsYW5nXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIGZ1bmN0aW9uIGFsbChsYW5nKSB7XG5cbiAgICB2YXIgbGFuZ0lkID0gbGFuZyB8fCBtYXJ2aW5JMThuTWVtb3J5LmN1cnJlbnQ7XG5cbiAgICBpZihtYXJ2aW4uaXNTb2xvKCkpIHtcbiAgICAgIHJldHVybiBhbmd1bGFyLmV4dGVuZCh7fSwgbWFydmluSTE4bk1lbW9yeS5kYXRhLl9jb21tb24gfHwge30sIG1hcnZpbkkxOG5NZW1vcnkuZGF0YVtsYW5nSWRdIHx8IHt9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFydmluSTE4bk1lbW9yeS5kYXRhW2xhbmdJZF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGVhY2ggdHJhbnNsYXRpb25zIGF2YWlsYWJsZSBmb3IgeW91ciBhcHBcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cbiAgZnVuY3Rpb24gdHJhbnNsYXRpb25zKCkge1xuICAgIHJldHVybiBtYXJ2aW5JMThuTWVtb3J5LmRhdGE7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgeW91IGFscmVhZHkgbG9hZCB0aGlzIGxhbmdcbiAgICogQHBhcmFtICB7U3RyaW5nfSAgbGFuZ1xuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gaXNMYW5nTG9hZGVkKGxhbmcpIHtcbiAgICAgIHJldHVybiAhIW1hcnZpbkkxOG5NZW1vcnkuZGF0YVtsYW5nXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgTGFuZ3VhZ2VcbiAgICogQHJldHVybiB7U3RyaW5nfSBsYW5nXG4gICAqL1xuICBmdW5jdGlvbiBjdXJyZW50KCkge1xuICAgIHJldHVybiBtYXJ2aW5JMThuTWVtb3J5LmN1cnJlbnQ7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgd2UgaGF2ZSBsb2FkZWQgaTE4blxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gaXNMb2FkZWQoKSB7XG4gICAgcmV0dXJuIG1hcnZpbkkxOG5NZW1vcnkuYWN0aXZlO1xuICB9XG5cbiAgLyoqXG4gICAqIExpc3QgZWFjaCBsYW5ndWFnZSBhdmFpbGFibGUgaW4gYmFiZWxmaXNoXG4gICAqIFdpdGggdGhlIHNvbG8gbW9kZSB5b3UgY2FuIHVzZSBhIGtleSBfY29tb20gdG8gc2hhcmUgYmV0d2VlbiBlYWNoIGxhbmcgYSB0cmFkLiBTbyB3ZSBjYW5ub3QgcmV0dXJuIGl0LlxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG4gIGZ1bmN0aW9uIGdldExhbmd1YWdlcygpIHtcbiAgICBpZihtYXJ2aW5JMThuTWVtb3J5LmF2YWlsYWJsZS5pbmRleE9mKCdfY29tb24nKSA+IC0xKSB7XG4gICAgICBtYXJ2aW5JMThuTWVtb3J5LmF2YWlsYWJsZS5zcGxpY2UobWFydmluSTE4bk1lbW9yeS5hdmFpbGFibGUuaW5kZXhPZignX2NvbW9uJyksMSk7XG4gICAgfVxuICAgIHJldHVybiBtYXJ2aW5JMThuTWVtb3J5LmF2YWlsYWJsZTtcbiAgfVxuXG5cbiAgcmV0dXJuIHtcbiAgICBnZXQ6IGdldCxcbiAgICBhbGw6IGFsbCxcbiAgICBjdXJyZW50OiBjdXJyZW50LFxuICAgIHRyYW5zbGF0aW9uczogdHJhbnNsYXRpb25zLFxuICAgIGxhbmd1YWdlczogZ2V0TGFuZ3VhZ2VzLFxuICAgIGlzTGFuZ0xvYWRlZDogaXNMYW5nTG9hZGVkLFxuICAgIGlzTG9hZGVkOiBpc0xvYWRlZFxuICB9O1xufSk7Iiwic2VydmljZSgnYmFiZWxmaXNoTGFuZ0xvYWRlcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkaHR0cCwgbWFydmluLCBtYXJ2aW5JMThuTWVtb3J5KSB7XG5cbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBtb2RlbCA9IG1hcnZpbkkxOG5NZW1vcnkuZ2V0KCk7XG5cbiAgLyoqXG4gICAqIExhenkgbG9hZCB0cmFuc2xhdGlvbnMgZm9yIGEgbGFuZ1xuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHVybFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHN0YXRlTmFtZVxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKi9cbiAgZnVuY3Rpb24gaW5pdExhenkodXJsLCBzdGF0ZU5hbWUpIHtcbiAgICB2YXIgbGFuZ0NvbmZpZyA9IG1hcnZpbi5nZXRMYXp5Q29uZmlnQnlVcmwodXJsKTtcblxuICAgIG1vZGVsLmF2YWlsYWJsZSA9IG1hcnZpbi5nZXRMYXp5TGFuZ0F2YWlsYWJsZSgpO1xuICAgIG1vZGVsLmN1cnJlbnQgPSBsYW5nQ29uZmlnLmxhbmc7XG4gICAgbW9kZWwuY3VycmVudFN0YXRlID0gc3RhdGVOYW1lO1xuXG4gICAgaWYobGF6eUNvbmZpZy5kYXRhKSB7XG4gICAgICBtb2RlbC5kYXRhW3N0YXRlTmFtZV0gPSBsYXp5Q29uZmlnLmRhdGE7XG4gICAgfVxuXG4gIH1cblxuICAvKipcbiAgICogTG9hZCBhIHRyYW5zbGF0aW9uIGZvciBhIGN1cnJlbnQgc3RhdGUgZnJvbSBzdGF0aWMgZGF0YVxuICAgKiBGb3IgZWFjaCBsYW5nIGFuZCBzdGF0ZSB5b3UgY2FuIHVzZSB0aGUga2V5IGRhdGEgaW4gb3JkZXIgdG8gbG9hZCB0aGVzZSBkYXRhXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdXJsXG4gICAqIEBwYXJhbSAge1N0cmluZ30gc3RhdGVOYW1lXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqL1xuICBmdW5jdGlvbiBpbml0U3RhdGljRGF0YSh1cmwsIHN0YXRlTmFtZSkge1xuICAgIG1vZGVsLmN1cnJlbnQgPSBtYXJ2aW4uZ2V0RGVmYXVsdExhbmcoKTtcbiAgICBtb2RlbC5jdXJyZW50U3RhdGUgPSBzdGF0ZU5hbWU7XG4gICAgbW9kZWwuZGF0YSA9IG1hcnZpbi5kYXRhO1xuICAgIG1vZGVsLmF2YWlsYWJsZSA9IE9iamVjdC5rZXlzKG1hcnZpbi5kYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIGEgdHJhbnNsYXRpb24gZmlsZVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHVybCAgVVJMIGZvciB0aGUgY3VycmVudCB0cmFuc2xhdGlvblxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHN0YXRlTmFtZSBTdGF0ZSdzIG5hbWVcbiAgICovXG4gIGZ1bmN0aW9uIGluaXQodXJsLCBzdGF0ZU5hbWUpIHtcblxuICAgIGRlYnVnZ2VyO1xuICAgIGlmKCFtb2RlbC5kYXRhIHx8IG1vZGVsLmRhdGFbbW9kZWwuY3VycmVudF0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBtYXJ2aW4uaXNMYXp5KCkgJiYgaW5pdExhenkodXJsLCBzdGF0ZU5hbWUpO1xuICAgIG1hcnZpbi5kYXRhICYmIGluaXRTdGF0aWNEYXRhKHVybCwgc3RhdGVOYW1lKTtcblxuICAgIHNldFRyYW5zbGF0aW9uKG1vZGVsLmN1cnJlbnRTdGF0ZSk7XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBhIHRyYW5zbGF0aW9uIHRvIHRoZSAkc2NvcGVcbiAgICogLSBkb2MgQkNQIDQ3IHtAbGluayBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9iY3A0N31cbiAgICogLSBkb2MgVmFsdWUgb2YgSFRNTDUgbGFuZyBhdHRyIHtAbGluayBodHRwOi8vd2VibWFzdGVycy5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvMjgzMDcvdmFsdWUtb2YtdGhlLWh0bWw1LWxhbmctYXR0cmlidXRlfVxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGFnZSBTdGF0ZSB0byBsb2FkXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqL1xuICBmdW5jdGlvbiBzZXRUcmFuc2xhdGlvbihwYWdlKSB7XG5cbiAgICBwYWdlID0gcGFnZSB8fCBtb2RlbC5jdXJyZW50U3RhdGUgIHx8IG1hcnZpbi5zdGF0ZTtcblxuICAgIHZhciBsYW5nID0gbW9kZWwuY3VycmVudCxcbiAgICAgICAgY3VycmVudFBhZ2VUcmFuc2xhdGlvbiA9IHt9LFxuICAgICAgICBjb21tb24gPSB7fTtcblxuICAgIC8vIFByZXZlbnQgdG9vIG1hbnkgZGlnZXN0XG4gICAgaWYobW9kZWwuY3VycmVudFN0YXRlID09PSBwYWdlICYmIG1vZGVsLnN0YXRlTG9hZGVkICYmIG1vZGVsLmN1cnJlbnQgPT09IG1vZGVsLnByZXZpb3VzTGFuZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG1vZGVsLmFjdGl2ZSA9IHRydWU7XG5cbiAgICBpZihtb2RlbC5kYXRhW2xhbmddKSB7XG5cbiAgICAgIC8qKlxuICAgICAgICogUHJldmVudCB0aGUgZXJyb3JcbiAgICAgICAqICAgICA+IFR5cGVFcnJvcjogQ2Fubm90IHJlYWQgcHJvcGVydHkgJyQkaGFzaEtleScgb2YgdW5kZWZpbmVkXG4gICAgICAgKiBjZiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Rob2tvL25nQmFiZWxmaXNoL2lzc3Vlcy81fVxuICAgICAgICovXG4gICAgICBpZighbW9kZWwuZGF0YVtsYW5nXVtwYWdlXSkge1xuICAgICAgICBtb2RlbC5kYXRhW2xhbmddW3BhZ2VdID0ge307XG5cbiAgICAgICAgaWYobWFydmluLmlzVmVyYm9zZSgpKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdbYmFiZWxmaXNoTGFuZ0xvYWRlckBzZXRUcmFuc2xhdGlvbl0gTm8gdHJhbnNsYXRpb24gYXZhaWxhYmxlIGZvciB0aGUgcGFnZSAlcyBmb3IgdGhlIGxhbmcgJXMnLHBhZ2UsIGxhbmcpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGFuZ3VsYXIuZXh0ZW5kKGNvbW1vbiwgbW9kZWwuZGF0YVtsYW5nXS5fY29tbW9uKTtcbiAgICAgIGN1cnJlbnRQYWdlVHJhbnNsYXRpb24gPSBhbmd1bGFyLmV4dGVuZChjb21tb24sIG1vZGVsLmRhdGFbbGFuZ11bcGFnZV0pO1xuXG4gICAgICBpZihtYXJ2aW4uZ2V0TmFtZXNwYWNlKCkpIHtcbiAgICAgICAgZGVidWdnZXJcbiAgICAgICAgJHJvb3RTY29wZVttYXJ2aW4uZ2V0TmFtZXNwYWNlKCldID0gY3VycmVudFBhZ2VUcmFuc2xhdGlvbjtcbiAgICAgIH1lbHNlIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQoJHJvb3RTY29wZSwgY3VycmVudFBhZ2VUcmFuc2xhdGlvbik7XG5cbiAgICAgICAgaWYobWFydmluLmlzVmVyYm9zZSgpKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdbYmFiZWxmaXNoTGFuZ0xvYWRlckBzZXRUcmFuc2xhdGlvbl0gSXQgaXMgYmV0dGVyIHRvIExvYWQgaTE4biBpbnNpZGUgYSBuYW1lc3BhY2UuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbW9kZWwuc3RhdGVMb2FkZWQgPSB0cnVlO1xuXG4gICAgICBpZihtYXJ2aW4uaXNMYXp5KCkpIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQoY29tbW9uLCBtb2RlbC5kYXRhW2xhbmddLl9jb21tb24pO1xuICAgICAgICBjdXJyZW50UGFnZVRyYW5zbGF0aW9uID0gYW5ndWxhci5leHRlbmQoY29tbW9uLCBtb2RlbC5kYXRhW3BhZ2VdKTtcblxuICAgICAgICBpZihjb25maWcubmFtZXNwYWNlKSB7XG4gICAgICAgICAgJHJvb3RTY29wZVtjb25maWcubmFtZXNwYWNlXSA9IGN1cnJlbnRQYWdlVHJhbnNsYXRpb247XG4gICAgICAgIH1lbHNlIHtcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZCgkcm9vdFNjb3BlLCBjdXJyZW50UGFnZVRyYW5zbGF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAkcm9vdFNjb3BlLiRlbWl0KCduZ0JhYmVsZmlzaC50cmFuc2xhdGlvbjpsb2FkZWQnLCB7XG4gICAgICAgIGN1cnJlbnRTdGF0ZTogcGFnZSxcbiAgICAgICAgbGFuZzogbGFuZ1xuICAgICAgfSk7XG4gICAgfVxuXG4gIH1cblxuICAvKipcbiAgICogTG9hZCBhIHRyYW5zbGF0aW9uIHRvIHRoZSAkc2NvcGVcbiAgICogLSBkb2MgQkNQIDQ3IHtAbGluayBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9iY3A0N31cbiAgICogLSBkb2MgVmFsdWUgb2YgSFRNTDUgbGFuZyBhdHRyIHtAbGluayBodHRwOi8vd2VibWFzdGVycy5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvMjgzMDcvdmFsdWUtb2YtdGhlLWh0bWw1LWxhbmctYXR0cmlidXRlfVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbGFuZyBZb3VyIGxhbmd1YWdlIGNmIEJDUCA0N1xuICAgKi9cbiAgZnVuY3Rpb24gc2V0U29sb1RyYW5zbGF0aW9uKCkge1xuXG4gICAgdmFyIGxhbmcgPSBtb2RlbC5jdXJyZW50LFxuICAgICAgICBjdXJyZW50UGFnZVRyYW5zbGF0aW9uID0ge30sXG4gICAgICAgIGNvbW1vbiA9IHt9O1xuXG4gICAgLy8gUHJldmVudCB0b28gbWFueSBkaWdlc3RcbiAgICBpZihsYW5nID09PSBtb2RlbC5wcmV2aW91c0xhbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBtb2RlbC5hY3RpdmUgPSB0cnVlO1xuXG5cbiAgICBpZihtb2RlbC5kYXRhW2xhbmddKSB7XG5cbiAgICAgIGFuZ3VsYXIuZXh0ZW5kKGNvbW1vbiwgbW9kZWwuZGF0YS5fY29tbW9uIHx8IHt9KTtcbiAgICAgIGN1cnJlbnRQYWdlVHJhbnNsYXRpb24gPSBhbmd1bGFyLmV4dGVuZChjb21tb24sIG1vZGVsLmRhdGFbbGFuZ10pO1xuXG4gICAgICBpZihtYXJ2aW4uZ2V0TmFtZXNwYWNlKCkpIHtcbiAgICAgICAgZGVidWdnZXJcbiAgICAgICAgJHJvb3RTY29wZVttYXJ2aW4uZ2V0TmFtZXNwYWNlKCldID0gY3VycmVudFBhZ2VUcmFuc2xhdGlvbjtcbiAgICAgIH1lbHNlIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQoJHJvb3RTY29wZSwgY3VycmVudFBhZ2VUcmFuc2xhdGlvbik7XG5cbiAgICAgICAgaWYobWFydmluLmlzVmVyYm9zZSgpKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKCdbYmFiZWxmaXNoTGFuZ0xvYWRlckBzZXRTb2xvVHJhbnNsYXRpb25dIEl0IGlzIGJldHRlciB0byBMb2FkIGkxOG4gaW5zaWRlIGEgbmFtZXNwYWNlLicpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgICRyb290U2NvcGUuJGVtaXQoJ25nQmFiZWxmaXNoLnRyYW5zbGF0aW9uOmxvYWRlZCcsIHtcbiAgICAgICAgbGFuZzogbGFuZ1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgYSB0cmFuc2xhdGlvbiBmb3IgYSBzdGF0ZVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHVybFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHN0YXRlTmFtZVxuICAgKiBAcmV0dXJuIHskcS5Qcm9taXNlfVxuICAgKi9cbiAgZnVuY3Rpb24gbG9hZCh1cmwsIHN0YXRlTmFtZSkge1xuXG4gICAgdXJsID0gdXJsIHx8IG1hcnZpbi5nZXRDb25maWcoKS51cmw7XG4gICAgc3RhdGVOYW1lID0gc3RhdGVOYW1lIHx8IG1hcnZpbi5nZXRDb25maWcoKS5zdGF0ZTtcbiAgICBpZihtYXJ2aW4uaXNMYXp5KCkpIHtcbiAgICAgIHVybCA9IG1hcnZpbi5nZXRMYXp5Q29uZmlnKG1vZGVsLmN1cnJlbnQgfHwgbWFydmluLmdldENvbmZpZygpLmxhbmcpO1xuICAgIH1cblxuICAgIGluaXQodXJsLCBzdGF0ZU5hbWUpO1xuXG4gICAgcmV0dXJuICRodHRwLmdldCh1cmwpXG4gICAgICAuZXJyb3IoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKG1hcnZpbi5pc1ZlcmJvc2UoKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignW2JhYmVsZmlzaExhbmdMb2FkZXJAbG9hZF0gQ2Fubm90IGxvYWQgdGhlIHRyYW5zbGF0aW9uIGZpbGUnKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGlmKG1hcnZpbi5pc0xhenkoKSkge1xuICAgICAgICAgIG1vZGVsLmRhdGFbbW9kZWwuY3VycmVudF0gPSBkYXRhO1xuICAgICAgICB9ZWxzZSB7XG4gICAgICAgICAgbW9kZWwuZGF0YSA9IGRhdGE7XG4gICAgICAgICAgbW9kZWwuYXZhaWxhYmxlID0gT2JqZWN0LmtleXMoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgaWYoIW1hcnZpbi5pc1NvbG8oKSkge1xuICAgICAgICAgIHNldFRyYW5zbGF0aW9uKG1vZGVsLmN1cnJlbnRTdGF0ZSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHNldFNvbG9UcmFuc2xhdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIGEgdHJhbnNsYXRpb24gdG8gdGhlICRzY29wZSBmb3IgYSBsYW5ndWFnZVxuICAgKiAtIGRvYyBCQ1AgNDcge0BsaW5rIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL2JjcDQ3fVxuICAgKiAtIGRvYyBWYWx1ZSBvZiBIVE1MNSBsYW5nIGF0dHIge0BsaW5rIGh0dHA6Ly93ZWJtYXN0ZXJzLnN0YWNrZXhjaGFuZ2UuY29tL3F1ZXN0aW9ucy8yODMwNy92YWx1ZS1vZi10aGUtaHRtbDUtbGFuZy1hdHRyaWJ1dGV9XG4gICAqIEB0cmlnZ2VyIHtFdmVudH0gaTE4bjpiYWJlbGZpc2g6Y2hhbmdlZCB7cHJldmlvdXM6WFhYLHZhbHVlOlhYWDJ9XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBsYW5nIFlvdXIgbGFuZ3VhZ2UgY2YgQkNQIDQ3XG4gICAqL1xuICBmdW5jdGlvbiBsb2FkTGFuZ3VhZ2UobGFuZykge1xuXG4gICAgdmFyIGRlZmF1bHRMYW5nID0gbWFydmluLmdldERlZmF1bHRMYW5nKCk7XG5cblxuICAgIC8vIEZpbmQgdGhlIGN1cnJlbnQgbGFuZyBpZiBpdCBkb2Vzbid0IGV4aXN0LiBTdG9yZSB0aGUgcHJldmlvdXMgb25lIHRvb1xuICAgIGlmKCFsYW5nKSB7XG4gICAgICBtb2RlbC5wcmV2aW91c0xhbmcgPSBsYW5nID0gZGVmYXVsdExhbmc7XG4gICAgfWVsc2Uge1xuICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmxhbmcgPSBsYW5nLnNwbGl0KCctJylbMF07XG4gICAgICBtb2RlbC5wcmV2aW91c0xhbmcgPSBkZWZhdWx0TGFuZztcbiAgICB9XG5cbiAgICBtb2RlbC5jdXJyZW50ID0gbGFuZztcblxuICAgICRyb290U2NvcGUuJGVtaXQoJ25nQmFiZWxmaXNoLnRyYW5zbGF0aW9uOmNoYW5nZWQnLCB7XG4gICAgICBwcmV2aW91czogZGVmYXVsdExhbmcsXG4gICAgICB2YWx1ZTogbGFuZ1xuICAgIH0pO1xuXG4gICAgLy8gTG9hZCB0aGUgbmV3IGxhbmd1YWdlIGlmIHdlIGRvIG5vdCBhbHJlYWR5IGhhdmUgaXRcbiAgICBpZihtYXJ2aW4uaXNMYXp5KCkgJiYgIW1vZGVsLmRhdGFbbGFuZ10pIHtcbiAgICAgIHNlcnZpY2UubG9hZChtYXJ2aW4uZ2V0TGF6eUNvbmZpZyhsYW5nKS51cmwsIG1vZGVsLmN1cnJlbnRTdGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgc29tZSBkYXRhIGZyb20gYSBjYWNoZVxuICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxuICAgKiByZXR1cm4ge3ZvaWR9XG4gICAqL1xuICBmdW5jdGlvbiBzZXRTdGF0aWNEYXRhKGRhdGEpIHtcbiAgICBpZighZGF0YVttb2RlbC5jdXJyZW50XSkge1xuICAgICAgbW9kZWwuZGF0YVttb2RlbC5jdXJyZW50XSA9IGRhdGE7XG4gICAgfWVsc2Uge1xuICAgICAgbW9kZWwuZGF0YSA9IGRhdGE7XG4gICAgfVxuICAgIHNldFRyYW5zbGF0aW9uKCk7XG4gIH1cblxuICAvLyBMaXN0ZW4gd2hlbiB5b3UgY2hhbmdlIHRoZSBsYW5ndWFnZSBpbiB5b3VyIGFwcGxpY2F0aW9uXG4gICRyb290U2NvcGUuJG9uKCduZ0JhYmVsZmlzaC50cmFuc2xhdGlvbjpjaGFuZ2VkJywgZnVuY3Rpb24oKSB7XG4gICAgaWYoIW1hcnZpbi5pc1NvbG8oKSkge1xuICAgICAgc2V0VHJhbnNsYXRpb24obW9kZWwuY3VycmVudFN0YXRlKTtcbiAgICB9ZWxzZXtcbiAgICAgIHNldFNvbG9UcmFuc2xhdGlvbigpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0OiBpbml0LFxuICAgIGluaXRMYXp5OiBpbml0TGF6eSxcbiAgICBpbml0U3RhdGljRGF0YTogaW5pdFN0YXRpY0RhdGEsXG4gICAgdXBkYXRlU3RhdGU6IHNldFRyYW5zbGF0aW9uLFxuICAgIHNldFNvbG9UcmFuc2xhdGlvbjogc2V0U29sb1RyYW5zbGF0aW9uLFxuICAgIHNldFN0YXRpY0RhdGE6IHNldFN0YXRpY0RhdGEsXG4gICAgbG9hZDogbG9hZCxcbiAgICB1cGRhdGVMYW5nOiBsb2FkTGFuZ3VhZ2VcbiAgfTtcblxufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=