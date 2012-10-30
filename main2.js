// Using Escodegen https://github.com/Constellation/escodegen

var util = require("util"),
    fs = require("fs"),
    _ = require("underscore"),
    escodegen = require("escodegen");

Parser = require("./parser");
parser = Parser.parser;
isSymbol = function(x){
  return x instanceof Parser.Symbol;
}

exprs = parser.parse(fs.readFileSync("rum_main.rmk", "utf8"));

util.puts(util.inspect(exprs, false, null, true));
util.puts("--");

function raise(msg, info){
  info || (info = {});
  info["ERROR"] = msg;
  throw util.inspect(info);
}

function raiseIf(cond, msg, info){
  if (cond) { raise(msg, info) }
}

function ast(typename, info){
  info["type"] = typename;
  return info;
}

function convertDefvar(left, rest){
  if (rest.length === 0) 
    var init = null;
  else if (rest.length === 1)
    var init = convertValue(rest[0]);
  else
    raise("malformed defvar", {left:left, rest:rest});

  return ast("VariableDeclaration", {
      kind: "var",
      declarations: [
        ast("VariableDeclarator", {
          id: convertValue(left),
          init: init
        })
      ]
    });
}

function convertDefun(left, rest){
  throw 4;
}

// Returns JS-AST for Escodegen.
function convertValue(v){
  if (_.isNumber(v) || _.isString(v) || _.isRegExp(v) ||
      _.isBoolean(v) || _.isNull(v) || _.isUndefined(v)){
    return ast("Literal", {value: v});
  }
  else if(_.isEmpty(v)){
    return ast("ObjectExpression", {properties: []});
  }
  else if(isSymbol(v)) {
    return ast("Identifier", {name: v.jsName});
  }
  else if(_.isArray(v)){ // application
    var first = v[0].name, rest = v.slice(1);
    switch(first){
      case "define":
        var left = v[1], rest = v.slice(2);
        if (isSymbol(left))
          return convertDefvar(left, rest);
        else if (_.isArray(left))
          return convertDefun(left, rest);
        else
          raise("malformed define", {left:left, rest:rest});
      default:
        return ast("CallExpression", {
            callee: convertValue(v[0]),
            arguments: rest.map(convertValue)
          });
        throw 3;
    }
  }
  else {
    throw 2;
  }
}

exprs.forEach(function(expr){
  util.puts(escodegen.generate(convertValue(expr)));
});
