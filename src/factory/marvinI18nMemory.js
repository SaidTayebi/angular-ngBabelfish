factory('marvinI18nMemory', function() {
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
});