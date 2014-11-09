service('translator', function ($rootScope, babelfish, marvinMemory) {

  var service = this;

  this.translate = function translate() {
    var state = marvinMemory.get('currentState'),
        currentLang = marvinMemory.get('lang').current,
        previousLang = marvinMemory.get('lang').previous;

    if(currentLang === previousLang) {
      return;
    }

  };

});
