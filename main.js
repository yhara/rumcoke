util = require("util");
_ = require("underscore");
Parser = require("./parser");
parser = Parser.parser;
Sym = Parser.Sym;

exprs = parser.parse(' \
(define util (require "util")) \
(define _ (require "underscore")) \
(define Parser (require "./parser")) \
(define parser (.. Parser parser)) \
(define Sym (.. Parser Sym)) \
\
(define exprs (.. parser (parse "77"))) \
'
);
//console.log(JSON.stringify(exprs, null, 2))
util.puts(util.inspect(exprs, false, null, true));
util.puts("--");

function convert_dotdot(receiver, callSpecs){
  return convert_value(receiver) + "." +
    callSpecs.map(function(callSpec){
      if (callSpec instanceof Parser.Symbol) {
        return callSpec.name;
      }
      else if (_.isArray(callSpec)) {
        return convert_value(callSpec);
      }
      else {
        throw {msg: "malformed ..",
               receiver: receiver,
               callSpec: callSpec,
               callSpecs: callSpecs};
      }
    }).join(".");
}

function convert_value(v){
  if (_.isNumber(v) || _.isBoolean(v) || _.isRegExp(v)){
    return v.toString();
  }
  else if(_.isString(v)){
    return '"' + v.toString() + '"';
  }
  else if(v instanceof Parser.Symbol) {
    return v.name;
  }
  else if(_.isArray(v)){ // application
    var first = v[0].name;
    if (first === "..") {
      return convert_dotdot(v[1], v.slice(2));
    }
    else {
      return first + "(" + v.slice(1).map(function(arg){
        return convert_value(arg);
      }).join(", ") + ")";
    }
  }
  else {
    throw "failed to convert value";
  }
}

function convert_toplevel(e) {
  if (_.isArray(e)){
    switch (e[0]) {
      case Sym("define"):
        return "var " + e[1].name + " = " + convert_value(e[2]) + ";";
        break;
    }
  }
  else {
    return convert_value(e);
  }
}

exprs.forEach(function(expr){
  util.puts(convert_toplevel(expr));
});
