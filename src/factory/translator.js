module.exports = ['$rootScope', '$http', function ($rootScope, $http) {

    var config = {};
    var i18n = {
        current: "",
        data: {},
        available: [],
        currentState: "",
        active: false,
        previousLang: config.lang,
        stateLoaded: false
    };



    /**
     * Load a translation to the $scope for a language
     * - doc BCP 47 {@link http://tools.ietf.org/html/bcp47}
     * - doc Value of HTML5 lang attr {@link http://webmasters.stackexchange.com/questions/28307/value-of-the-html5-lang-attribute}
     * @trigger {Event} i18n:babelfish:changed {previous:XXX,value:XXX2}
     * @param {String} lang Your language cf BCP 47
     */
    function loadLanguage(lang) {

        var old = document.documentElement.lang;

        if(!old) {
            old = 'en';
        }

        // Find the current lang if it doesn't exist. Store the previous one too
        if(!lang) {
            lang = old + '-' + old.toUpperCase();
            i18n.previousLang = lang;
        }else {
            document.documentElement.lang = lang.split('-')[0];
            i18n.previousLang = old + '-' + old.toUpperCase();
        }

        config.lang = i18n.current = lang;

        $rootScope.$emit('ngBabelfish.translation:changed', {
            previous: (old + '-' + old.toUpperCase()),
            value: lang
        });

        // Load the new language if we do not already have it
        if(config.lazy && !i18n.data[lang]) {
            service.load();
        }

    }

    // Listen when you change the language in your application
    $rootScope.$on('ngBabelfish.translation:changed', function() {
        if(!config.isSolo) {
            setTranslation(i18n.currentState);
        }else{
            setSoloTranslation();
        }
    });

    var service = {

        setData: function setData(data) {

            i18n.stateLoaded = false;
            buildI18n(data);
            setTranslation();

        },

        /**
         * Configure this factory
         *
         * Available configuration:
         *
         *     var config = {
         *          state: 'home',
         *          lang: 'en-EN',
         *          url: '/i18n/languages.json',
         *          eventName: '$stateChangeSuccess',
         *          namespace: "",
         *          lazy: false,
         *          urls: [],
         *          current: "",
         *          log: true
         *      };
         * @param  {Object} customConfig
         */
        init: function init(customConfig) {
            config = customConfig;
        },

        /**
         * Load the module to be in solo mode without translations per state
         * @param  {Object} customConfig
         */
        initSolo: function initSolo(customConfig) {
            config = customConfig;
            config.isSolo = true;
        },

        /**
         * Load a translation file
         * @param  {String} url  URL for the current translation
         * @param  {String} name State's name
         */
        load: function load(url, name) {},

        /**
         * Load a new translation
         * @param {String} lang Lang to load
         * @param  {String} url  URL for the current translation
         */
        loadTranslation: function loadTranslation(lang, url) {

            url = url || loadLazyDefaultUrl(lang);

            if(!url) {
                throw new Error('[ngBabelfish-translator@loadTranslation] You want to load ' + lang + ' but you do not set an url for this lang (as a second argument)');
            }

            return $http.get(url)
                .error(function() {
                    alert("Cannot load i18n translation file");
                })
                .success(function (data) {

                    i18n.data[lang] = data;

                    if(config.lazy) {
                        i18n.available = config.urls.map(function (item) {return item.lang;});
                    }else {
                        i18n.available = Object.keys(i18n.data);
                    }
                });
        },

        /**
         * Return the current state translation
         * @param  {String} lang
         * @return {Object}
         */
        get: function get(lang) {
            var currentLang = i18n.data[lang || i18n.current] || {},
                common = {};


            if(config.isSolo) {
                return angular.extend({}, i18n.data._common || {}, currentLang);
            }


            if(!currentLang[i18n.currentState]) {

                if(config.log) {
                    console.warn('[ngBabelfish-translator@get] No translation available for the page %s for the  lang %s',i18n.currentState, (lang || i18n.current));
                }
                currentLang[i18n.currentState] = {};
            }

            angular.extend(common, {}, currentLang._common);
            return angular.extend(common, currentLang[i18n.currentState]);
        },

        /**
         * Get all translations available for a lang
         * @param  {String} lang
         * @return {Object}
         */
        all: function all(lang) {

            if(config.isSolo) {
                return angular.extend({}, i18n.data._common || {}, i18n.data[lang || i18n.current] || {});
            }

            return i18n.data[lang || i18n.current];
        },

        /**
         * Return each translations available for your app
         * @return {Object}
         */
        translations: function translations() {
          return i18n.data;
        },

        /**
         * Check if you already load this lang
         * @param  {String}  lang
         * @return {Boolean}
         */
        isLangLoaded: function isLangLoaded(lang) {
            return !!i18n.data[lang];
        },

        /**
         * Get the current Language
         * @return {String} lang
         */
        current: function current() {
            return i18n.current;
        },

        /**
         * Update translations for a state
         * @param  {String} state
         */
        updateState: setTranslation,

        /**
         * Update the lang for the application
         * It will load a new language
         * @param  {String} lang
         */
        updateLang: loadLanguage,

        /**
         * Check if we have loaded i18n
         * @return {Boolean}
         */
        isLoaded: function isLoaded() {
            return i18n.active;
        },

        /**
         * List each languages available for the application
         * @return {Array}
         */
        available: function available(){
            return i18n.available;
        },

        /**
         * Return the default event name in order to listen a new state||route
         * @return {String}
         */
        getEvent: function getEvent() {
            return config.eventName;
        },

        /**
         * Get the namespace of the application
         * @return {String}
         */
        getNamespace: function getNamespace() {
            return config.namespace;
        }
    };

    return service;
}];
