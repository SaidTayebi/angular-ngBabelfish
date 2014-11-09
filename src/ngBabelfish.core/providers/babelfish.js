provider('babelfish', function() {

  /**
   * I18n Service Provider
   * Load your translations and update $rootScope
   * It gives you access to your translation.
   */

  /**
   * Default configuration for the module
   * @type {Object}
   */
  var config = {
      state: 'home',
      lang: 'en-EN',
      url: '/i18n/languages.json',
      eventName: '$stateChangeSuccess',
      namespace: 'i18n',
      lazy: false,
      urls: [],
      current: '',
      verbose: true
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
   * Set the application in verbose mode or not
   * Default mode: verbose is set to true
   * @param  {Boolean}  verbose
   * @return {void}
   */
  this.isVerbose = function isVerbose(verbose) {
    config.verbose = verbose;
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
   * Babelfish service
   */
  this.$get = function() {
    return {
      /**
       * Return the configuration for the provider
       * @return {Object}
       */
      getConfig: function getConfig() {
        return config;
      },

      getDefaultLanguage: function getDefaultLanguage() {
        return config.lang;
      },

      /**
       * Return the default nameSpace for the app
       * @return {String}
       */
      getNameSpace: function getNameSpace() {
        return config.namespace;
      },

      /**
       * Get the eventName to listen when a new route is trigger
       * @return {String}
       */
      getEventName: function getEventName() {
        return config.eventName;
      },

      /**
       * Get each languages available in the application
       * @return {Array}
       */
      getLanguages: function getLanguages() {
        if(config.lazy) {
          return config.urls.map(function (item) {
            return item.lang;
          });
        }

        return [config.lang];
      },

      /**
       * Return the default State of the application
       * @return {String}
       */
      getState: function getState() {
        return config.state;
      },

      /**
       * Check if we are in lazy mode or not
       * @return {Boolean}
       */
      isLazy: function isLazy() {
        return config.lazy;
      },

      /**
       * Is the application is running with -vvv or not
       * @return {Boolean}
       */
      isVerbose: function isVerbose() {
        return config.verbose;
      }
    };
  };

});
