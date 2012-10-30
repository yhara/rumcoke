util = require("util");
_ = require("underscore");
//_.str = require('underscore.string');
//_.mixin(_.str.exports());
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
\
(.. Parser Sym) \
(.. util (puts (.. util (inspect exprs #f null #t)))) \
(.. util (puts "--")) \
\
(define (raise msg info) \
  (or info (set! info {})) \
  (aset! info "ERROR" msg) \
  (throw (.. util (inspect info)))) \
(define (raise-if cond msg info) \
  1) \
'
);
//console.log(JSON.stringify(exprs, null, 2))
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

function convert_dotdot(receiver, callSpecs){
  return convert_value(receiver) + "." +
    callSpecs.map(function(callSpec){
      if (callSpec instanceof Parser.Symbol) {
        return callSpec.jsName;
      }
      else if (_.isArray(callSpec)) {
        return convert_value(callSpec);
      }
      else {
        raise("malformed ..", {receiver: receiver, callSpec: callSpec, callSpecs: callSpecs});
      }
    }).join(".");
}

function convert_value(v){
  if (_.isNumber(v) || _.isBoolean(v) || _.isRegExp(v)){
    return v.toString();
  }
  else if(_.isString(v)){    return '"' + v.toString() + '"'; }
  else if(_.isNull(v)){      return "null"; }
  else if(_.isUndefined(v)){ return "undefined"; }
  else if(_.isEmpty(v) ){ return "{}"; }
  else if(v instanceof Parser.Symbol) {
    return v.jsName;
  }
  else if(_.isArray(v)){ // application
    var first = v[0].name, rest = v.slice(1);
    switch(first){
      case "..":
        return convert_dotdot(v[1], v.slice(2));
      case "or":
        if (rest.length == 0) {
          return "false";
        }
        else if(rest.length == 1){
          return "(" + convert_value(rest[0]) + ") || false"; 
        }
        else {
          return rest.map(function(item){
              // Note: wrapping with () in case of `a || (a = 1)'
              return "(" + convert_value(item) + ")"; 
            }).join(" || ");
        }
      case "set!":
        return convert_value(rest[0]) + " = " + convert_value(rest[1]);
      case "aset!":
        return convert_value(rest[0]) + "[" +
                 convert_value(rest[1]) +
               "] = " + convert_value(rest[2]);
      case "throw":
        return "throw " + rest.map(convert_value).join(", ");
      default:
        return first + "(" + rest.map(function(arg){
            return convert_value(arg);
          }).join(", ") + ")";
    }
  }
  else {
    raise("failed to convert value", {v: v});
  }
}

function convert_toplevel(e) {
  if (_.isArray(e)){
    switch (e[0]) {
      case Sym("define"):
        var left = e[1], rest = e.slice(2);
        if (left instanceof Parser.Symbol) {
          // defvar
          if (rest.length === 0) {
            return "var" + left.jsName + ";"
          }
          else if (rest.length === 1) {
            return "var " + left.jsName + " = " + convert_value(rest[0]) + ";";
          }
          else
            raise("malformed defvar", {left:left, rest:rest});
        }
        else if (_.isArray(left)) {
          // defun
          var fname = left[0], params = left.slice(1);
          raiseIf(!(fname instanceof Parser.Symbol), "malformed defun");
          return "var " + fname.jsName + " = function(" + 
            params.map(function(param){
              raiseIf(!(param instanceof Parser.Symbol), "malformed param")
              return param.jsName;
            }).join(", ") + ") {\n" +
            rest.map(function(bodyItem){
              return convert_value(bodyItem) + ";\n";
            }).join("") +
            "};";
        }
        else
          raise("malformed define", {left:left, rest:rest});
        break;
      default:
        return convert_value(e) + ";";
    }
  }
  else {
    return convert_value(e);
  }
}

exprs.forEach(function(expr){
  util.puts(convert_toplevel(expr));
});
