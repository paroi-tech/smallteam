var Compiler = require('monkberry').Compiler;
var loaderUtils = require('loader-utils');

module.exports = function (content) {
  this.cacheable();
  var options = loaderUtils.getOptions(this) || {};

  var compiler = new Compiler();

  if (options.globals) {
    compiler.globals = options.globals;
  }

  if (options.transforms) {
    options.transforms.forEach(function (transform) {
      compiler.transforms.push(transform);
    });
  }

  var request = loaderUtils.getCurrentRequest(this);

  try {
    var node = compiler.compile(request, content);
  } catch (error) {
    this.emitError(error.message);
    return '';
  }
  
  var output = node.toStringWithSourceMap();
  output.map.setSourceContent(request, content);

  this.callback(null, output.code, output.map.toJSON());
};
