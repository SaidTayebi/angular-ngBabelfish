service('languageLoader', function ($http, babelfish, translator, marvinMemory) {

  var service = this;

  this.fetch = function fetch(lang, url) {

    marvinMemory.get('lang').current = lang;

    return $http.get(url)
      .error(deferred.reject)
      .success(service.load)
      .then(translator.translate)

  };

  this.load = function load(data) {
    var translations = marvinMemory.get('i18n');
    translations[marvinMemory.get('lang').current] = data;

    marvinMemory.set('i18n',translations);
    marvinMemory.set('langAvailable',Object.keys(translations));
  };

});
