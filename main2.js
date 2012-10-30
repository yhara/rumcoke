// Using Escodegen https://github.com/Constellation/escodegen

var util = require("util"),
    _ = require("underscore"),
    escodegen = require("escodegen");

Parser = require("./parser");
parser = Parser.parser;
Sym = Parser.Sym;

exprs = parser.parse(' \
7 \
');

util.puts(util.inspect(exprs, false, null, true));
util.puts("--");

function ast(typename, info){
  info["type"] = typename;
  return info;
}

function convert_value(v){
  if (_.isNumber(v) || _.isString(v) || _.isRegExp(v) ||
      _.isBoolean(v) || _.isNull(v) || _.isUndefined(v)){
    return ast("Literal", {value: v});
  }
  else if(_.isEmpty(v)){
    return ast("ObjectExpression", {properties: []});
  }
  else if(v instanceof Parser.Symbol) {
    return ast("Identifier", {name: v.jsName});
  }
  else {
    throw 2;
  }
}

function convert_toplevel(e){
  if (_.isArray(e)){
    throw 1;
  }
  else {
    return convert_value(e);
  }
};

function ast2js(ast){
  return escodegen.generate(ast);
};

exprs.forEach(function(expr){
  util.puts(ast2js(convert_toplevel(expr)));
});
