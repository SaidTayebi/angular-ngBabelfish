factory('marvinMemory', function() {
  var data = {}, factory = {};

  factory.set = function set(key, value) {
    data[key] = value;
  };

  factory.get = function get(key) {
    return data[key];
  };

  return factory;
});