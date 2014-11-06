service('languageLoader', function ($http, babelfish, marvinHappy, marvinMemory) {

  var service = this;
  var currentLang;

  this.fetch = function fetch(lang, url) {

    currentLang = lang;

    return $http.get(url)
      .error(deferred.reject)
      .success(service.load)
      .then(marvinHappy.translate)

  };

  this.load = function load(data) {
    var translations = marvinMemory.get('i18n');
    translations[currentLang] = data;
    marvinMemory.set('i18n',translations);
  };

});