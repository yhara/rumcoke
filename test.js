#!/usr/bin/env node
//
// test.js
//
// $ node test.js
// should show nothing.

var util = require("util"),
    fs = require("fs"),
    _ = require("underscore"),
    escodegen = require("escodegen"),
    esprima = require("esprima");

var RumCoke = require('./lib/rumcoke');
if(_.contains(process.argv, "--debug")) {
  RumCoke = require("./debug/rumcoke");
}

var d = function (header, x) {
  util.puts(header + util.inspect(x, false, null, true));
};

function isEqv(a, b){
  var toString = Object.prototype.toString;
  var ret = null;
  if (a === b)
    ret = true;
  else if (a == null || b == null)
    ret = (a === b);
  else if (toString.call(a) != toString.call(b))
    ret = false;
  else {
    switch (toString.call(a)) {
      case '[object String]':
      case '[object Number]':
      case '[object Date]':
      case '[object Boolean]':
        ret = (a == b);
        break;
      case '[object RegExp]':
        ret = (a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase);
        break;
      default:
        if (typeof a != 'object' || typeof b != 'object')
          ret = false;
        else {
          for (k in a) {
            if (!isEqv(a[k], b[k])){
              ret = false;
              break;
            }
          }
          for (k in b) {
            if (!isEqv(a[k], b[k])){
              ret = false;
              break;
            }
          }
          if (ret === null) ret = true;
        }
    }
  }

  if (!ret){
    d("A: ", a);
    d("B: ", b);
  }
  return ret;
};

function test(rum_code, js_code){
  var expected_ast = esprima.parse(js_code)["body"][0];
  if (expected_ast.type == "ExpressionStatement")
    expected_ast = expected_ast.expression;

  var rum_expr = RumCoke.Parser.parser.parse(rum_code)[0];
  var given_ast = RumCoke.Translator.translateExpr(rum_expr);

  //if (!isEqv(given_ast, expected_ast)){
  if (!_.isEqual(given_ast, expected_ast)){
    d("Expected: ", expected_ast);
    util.puts("");
    d("Actual: ", given_ast);

    throw("failed: `" + rum_code + "` != `" + js_code + "`");
  }
}

function testm(rum_code, expanded_code){
  var expected_expr = RumCoke.Parser.parser.parse(expanded_code);
  var actual_expr = RumCoke.Translator.expandMacros(RumCoke.Parser.parser.parse(rum_code));

  if (!_.isEqual(actual_expr, expected_expr)){
    d("Expected:\n", expected_expr);
    util.puts("");
    d("Actual:\n", actual_expr);

    throw("expansion failed: `" + rum_code + "` !=> `" + expanded_code + "`");
  }
}

// Literals
test("a", "a");
test("$a", "$a");
test("#t", "true");
test("#f", "false");
test("#null", "null");
test("#undefined", "void 0");
test("7.65", "7.65");
test('"foo"', '"foo"');
test('"\\n"', '"\\n"');
test('"\\\\n"', '"\\\\n"');
test('#/foo/', '/foo/');
test('(array 1 2 3)', '[1,2,3]');
test('(f (a: 1 b: 2))', 'f({"a": 1, "b": 2})');

// Special forms
test("(define a 1)", "var a = 1;");
test("(define (f) 1)", "var f = function(){ return 1; };");
test("((^(x) x))", "(function(x){ return x })()");
test("(.. a b)", "a.b");
test("(.. a (b 1))", "a.b(1)");
test("(set! x 1)", "x = 1");
test("(aset! x y 1)", "x[y] = 1");
test("(new Date 2012 1 1)", "new Date(2012, 1, 1)");
test("(~ a b)", "a[b]");
test("(array 1 2)", "[1,2]");
// test(quote
test("(= x 1)", "x === 1");
//test("(if x y z)", "if(x) y; else z"); // TODO: bug?
//test("begin
test("(and x y)", "x && y"); 
test("(or)", "false"); 
test("(or x)", "x || false"); 
test("(or x y)", "x || y"); 
test("(or x y z)", "x || y || z"); 
test("(not x)", "!x");
test("(while 1 (f))", "while(1){ f(); }");
test("(while 1 (f) (g))", "while(1){ f(); g(); }");
test("(while 1 (break))", "while(1){ break }");
test("(throw x)", "throw x");

test('(raw-js-ast (type: "Literal" value: 7))', "7");

test("(+ x y z)", "x + y + z");
test("(- x y z)", "x - y - z");
test("(* x y z)", "x * y * z");
test("(/ x y z)", "x / y / z");

// Macro inside special forms
test("(f (a: (quote x)))", 'f({"a": Sym("x")})');
test("(define x (quote x))", "var x = Sym('x')");
test("(.. (quote x) y)", "Sym('x').y");
test("(.. (quote x) (y (quote z)))", "Sym('x').y(Sym('z'))");
test("((^(x) (quote x)))", "(function(x){ return Sym('x') })()");
test("(set! x (quote x))", "x = Sym('x')");
test("(aset! x (quote x) y)", "x[Sym('x')] = y");
test("(new (quote x))", "new (Sym('x'))");
test("(~ (quote x) 0)", "Sym('x')[0]");
test("(array (quote x))", "[Sym('x')]");
test("(= (quote x) y)", "Sym('x') === y");
//test("(if (quote x) (quote y) z)", "if(Sym('x')){ Sym('y') }else z");
test("(begin (quote x))", "{Sym('x')}");
test("(and (quote x) y)", "Sym('x') && y");
test("(or (quote x) y)", "Sym('x') || y");
test("(not (quote x))", "!Sym('x')");
test("(while (quote x) (quote y))", "while(Sym('x')){ Sym('y') }");
test("(throw (quote x))", "throw(Sym('x'))");

// Macros
test("(quote x)", "Sym('x')");
test("(quote (x y))", "[Sym('x'), Sym('y')]");
test("(instance? x y)", "x instanceof y");
test("(instance? x (instance? y z))", "x instanceof (y instanceof z)");
//test("(when x y z)", "if(x){ y; z; }");
test('(case a ((b c) d) )', 'switch(a){ case b: case c: d; break; }');
test('(case a (else c))', 'switch(a){ default: c; }');

testm("`(a b)", '(append (array (Sym "a")) (array (Sym "b")))');
testm("`(,a ,b)", '(append (array a) (array b))');
testm("`(,@a ,@b)", '(append a b)');
testm("`((a b))", '(append (array \
                     (append (array (Sym "a")) (array (Sym "b")))))');
testm("`(',b)",   '(append (array \
                     (append (array (Sym "quote")) (array b))))');
testm('(cond (a b) (c d e))', '(if a b (if c (begin d e) #undefined))');
testm('(cond (a b) (else c d))', '(if a b (begin c d))');
