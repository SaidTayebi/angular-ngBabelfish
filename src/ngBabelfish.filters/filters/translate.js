filter('translate', function (babelfish) {
  /**
   * transalte filter
   * Translate a string to another language
   * {{ name | translate:'fr-FR':"name"}}
   */
  return function (input, lang, key) {
    return babelfish.get(lang)[key];
  }
});
