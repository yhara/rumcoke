util = require("util");
_ = require("underscore");
Parser = require("./parser");
parser = Parser.parser;
Sym = Parser.Sym;

exprs = parser.parse(' \
(define util (require "util")) \
(define _ (require "underscore")) \
(define Parser (require "./parser")) \
'
);
//console.log(JSON.stringify(exprs, null, 2))
util.puts(util.inspect(exprs, false, null, true));
util.puts("--");

function convert_value(v){
  if (_.isNumber(v) || _.isBoolean(v) || _.isRegExp(v)){
    return v.toString();
  }
  else if(_.isString(v)){
    return '"' + v.toString() + '"';
  }
  else if(_.isArray(v)){ // function call
    var fname = v[0].name;
    return fname + "(" + v.slice(1).map(function(arg){
      return convert_value(arg);
    }).join(", ") + ")";
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
