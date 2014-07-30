/**
 * I18n Solo Service Provider
 * Load your translations and update $rootScope
 * It gives you access to your translation for your whole application without state
 *
 * It's better to use this service to translate, directives etc.
 */
module.exports = function() {

    "use strict";

    /**
     * Default configuration for the module
     * @type {Object}
     */
    var config = {
        lang: 'en-EN',
        url: '/i18n/translations.json',
        namespace: 'i18n',
        current: "",
        log: true
    };

    /**
     * Configure the service with a provider from the config of your module
     * @param  {Object} params Configuration object
     * @return {void}
     */
    this.init = function initTheBabelfishConfig(params) {
        angular.extend(config, params);
    };


    /**
     * Babelfish service
     */
    this.$get = ['translator', function (translator) {
        translator.initSolo(config);
        return Object.create(translator);
    }];
};