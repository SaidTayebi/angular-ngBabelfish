factory('marvinI18nMemory', function() {
  return {
    current: '',
    data: null,
    available: [],
    currentState: '',
    active: false,
    previousLang: config.lang,
    stateLoaded: false,

    /**
     * List each language available in babelfish
     * With the solo mode you can use a key _comom to share between each lang a trad. So we cannot return it.
     * @return {Array}
     */
    getLanguages: function getLanguages() {
      if(this.available.indexOf('_comon') > -1) {
        this.available.splice(this.available.indexOf('_comon'),1);
      }
      return this.available;
    };
  };
});