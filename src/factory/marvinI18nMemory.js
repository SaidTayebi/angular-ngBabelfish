factory('marvinI18nMemory', function() {
  return {
    current: '',
    data: null,
    available: [],
    currentState: '',
    active: false,
    previousLang: config.lang,
    stateLoaded: false
  };
});