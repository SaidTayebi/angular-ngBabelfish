/**
 * I18n module
 * Translate your application
 */
module.exports = angular.module('ngBabelfish.solo', [])
    .provider('theBabelfish', require('./providers/thebabelfish'))
    .factory('translator', require('./factory/translator'))
    .directive('i18nLoad', require('./directives/i18nLoad'))
    .directive('i18nBind', require('./directives/i18nBind'));
