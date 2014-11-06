/**
 * I18n Service Provider
 * Load your translations and update $rootScope
 * It gives you access to your translation.
 */
provider('babelfish', function() {

  /**
   * Default configuration for the module
   * @type {Object}
   */
  var config = {
      state: 'home',
      lang: 'en-EN',
      url: '/i18n/languages.json',
      eventName: '$stateChangeSuccess',
      namespace: '',
      lazy: false,
      urls: [],
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
   * Babelfish service
   */
  this.$get = function() {
    return {
      getConfig = function getConfig() {
        return config;
      },

      getNameSpace = function getNameSpace() {
        return config.namespace;
      },

      getLanguages = function getLanguages() {
        if(config.lazy) {
          return config.urls.map(function (item) {
            return item.lang;
          });
        }

        return [config.lang];
      },

      getState: function getState() {
        return config.state;
      },

      isVerbose: function isVerbose() {
        return config.verbose;
      }
    };
  };

});
