directive('i18nLoad', function (translator) {

  /**
   * i18nLoad directive
   * Load a translation from a click on a button with the attr i18n-load
   */
  return {
    restrict: 'A',
    link: function(scope,el,attr) {
      el.on('click',function() {
        scope.$apply(function() {
            translator.updateLang(attr.i18nLoad);
        });
      });
    }
  };
});
