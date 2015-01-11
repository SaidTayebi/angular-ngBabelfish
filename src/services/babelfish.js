service('babelfish', function (marvin, marvinI18nMemory) {
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
});