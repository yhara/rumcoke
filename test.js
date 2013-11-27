#!/usr/bin/env node
//
// test.js
//
// $ node test.js
// should show nothing.

// Options
var PRINT_CASES = false;

var util = require("util"),
    fs = require("fs"),
    _ = require("underscore"),
    escodegen = require("escodegen"),
    esprima = require("esprima");

var RumCoke = require('./lib/rumcoke');
if(_.contains(process.argv, "--debug")) {
  RumCoke = require("./debug/rumcoke");
}

// Print debug message to stderr
var d = function (header, value) {
  util.debug(header + util.inspect(value, false, null, true));
};

// Compare objects a and b
// (For debug use)
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
  if (PRINT_CASES) {
    util.puts("test | "+rum_code+" | "+js_code+" |");
  }

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
    d("Actual js:\n---\n" + escodegen.generate(given_ast) + "\n---\n");

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

// Literals / macro inside literals
test("a", "a");
test("$a", "$a");
test("#t", "true");
test("#f", "false");
test("#null", "null");
test("#undefined", "void 0");
test("3", "3");
test("-3", "-3");
test("7.65", "7.65");
test("-5.73", "-5.73");
test('"foo"', '"foo"');
test('"\\n"', '"\\n"');
test('"\\\\n"', '"\\\\n"');
test('#/foo/', '/foo/');
test('(f (a: 1 b: 2))', 'f({"a": 1, "b": 2})');
test("(f (a: 'q))", 'f({"a": Sym("q")})');

// Special forms / macro inside special forms
test("(define a 1)", "var a = 1;");
test("(define (f) 1)", "var f = function(){ return 1; };");
test("(define x 'q)", "var x = Sym('q')");

test("((^(x) x))", "(function(x){ return x })()");
test("((^(x) 'q))", "(function(x){ return Sym('q') })()");

test("(.. a b)", "a.b");
test("(.. a (b 1))", "a.b(1)");
test("(.. 'q x)", "Sym('q').x");
test("(.. 'q (x 'r))", "Sym('q').x(Sym('r'))");

test("(set! x 1)", "x = 1");
test("(set! x.y 1)", "x.y = 1");
test("(set! x.y.z ab.cd.ef)", "x.y.z = ab.cd.ef");
test("(set! x 'q)", "x = Sym('q')");

test("(aset! x y 1)", "x[y] = 1");
test("(aset! x 'q 'r)", "x[Sym('q')] = Sym('r')");

test("(~ a b)", "a[b]");
test("(~ a b c)", "a[b][c]");
test("(~ 'q 'r)", "Sym('q')[Sym('r')]");

test("(new Date 2012 1 1)", "new Date(2012, 1, 1)");
test("(new 'q)", "new (Sym('q'))");

test("(array 1 2)", "[1,2]");
test("(array 'q)", "[Sym('q')]");

test("(= x 1)", "x === 1");
test("(= 'q y)", "Sym('q') === y");

test("(if x y z)", "if(x) y; else z");
test("(if x (begin 1))", "if(x){ 1 }");
test("(f (if x (begin 1)))", "f(x ? (function(){return 1}).call(this) : void 0);");
test("(if 'q 'r 's)", "if(Sym('q')) Sym('r'); else Sym('s')");

test("(case a ((b c) d) )", 'switch(a){ case b: case c: d; break; }');
test("(case a (else c))", 'switch(a){ default: c; }');
test("(print (case a (else c)))", 'print((function(){ \
                                            switch(a){ default: return c; }\
                                          }).call(this))');
test("(case 'q (else 't))", "switch(Sym('q')){ default: Sym('t'); }");

test("(f (begin 1 2))", "f((function(){1; return 2}).call(this))");
test("(begin 'q)", "{Sym('q')}");

test("(and x y)", "x && y"); 
test("(and 'q y)", "Sym('q') && y");

test("(or)", "false"); 
test("(or x)", "x || false"); 
test("(or x y)", "x || y"); 
test("(or x y z)", "x || y || z"); 
test("(or 'q y)", "Sym('q') || y");

test("(not x)", "!x");
test("(not 'q)", "!Sym('q')");

test("(while 1 (f))", "while(1){ f(); }");
test("(while 1 (f) (g))", "while(1){ f(); g(); }");
test("(while 1 (break))", "while(1){ break }");
test("(while 'q 'r)", "while(Sym('q')){ Sym('r') }");

test("(for (set! i 0) (< i 3) (inc! i) 1)", "for(i=0; i<3; i++){ 1 }");
test("((^(x) (for #f #f #f 1)))", "(function(x){for(false;false;false){ 1 }})()");
test("(for (set! i 0) (< i 3) (inc! i) 'q)", "for(i=0; i<3; i++){ Sym('q') }");

test("(while 1 (break))", "while(1){break}");

test("(throw x)", "throw x");
test("((^(x) (throw 1)))", "(function(x){throw 1;})()");
test("(throw 'q)", "throw(Sym('q'))");

test("(instance? x y)", "x instanceof y");
test("(instance? 'q 'r)", "Sym('q') instanceof Sym('r')");

test("(inc! x)", "x++");
//TODO: (inc! (id 7)) with (define-macro (id x) x)

test("(dec! x.y)", "x.y--");
//TODO: (dec! (id 7)) with (define-macro (id x) x)

test('(raw-js-ast (type: "Literal" value: 7))', "7");
//FIXME: test('(raw-js-ast (type: "Literal" value: \'x))', "Sym('x')");

test("(+ x y z)", "x + y + z");
test("(+)", "0");
test("(+ 3)", "3");
test("(+ -3)", "-3");
test("(+ '7)", "7");

test("(- x y z)", "x - y - z");
test("(- 3)", "-3");
test("(- '7)", "-7");

test("(* x y z)", "x * y * z");
test("(*)", "1");
test("(* 3)", "3");
test("(* -3)", "-3");
test("(* '7)", "7");

test("(/ x y z)", "x / y / z");
test("(/ 3)", "1/3");
test("(/ '7)", "1/7");

test("(< x y z)", "x < y && y < z");
test("(< 1 '7)", "1 < 7");

test("(> x y z)", "x > y && y > z");
test("(> 1 '7)", "1 > 7");

test("(<= x y z)", "x <= y && y <= z");
test("(<= 1 '7)", "1 <= 7");

test("(>= x y z)", "x >= y && y >= z");
test("(>= 1 '7)", "1 >= 7");

// Macros
test("(quote x)", "Sym('x')");
test("(quote (x y))", "[Sym('x'), Sym('y')]");
testm("(when x y z)", "(if x (begin y z))");
testm("(unless x y z)", "(if (not x) (begin y z))");

testm("`(a b)", '(append (array (Sym "a")) (array (Sym "b")))');
testm("`(,a ,b)", '(append (array a) (array b))');
testm("`(,@a ,@b)", '(append a b)');
testm("`((a b))", '(append (array \
                     (append (array (Sym "a")) (array (Sym "b")))))');
testm("`(',b)",   '(append (array \
                     (append (array (Sym "quote")) (array b))))');
testm("`(1 #undefined)", '(append (array 1) (array #undefined))');
testm('(cond (a b) (c d e))', '(if a b (if c (begin d e) #undefined))');
testm('(cond (a b) (else c d))', '(if a b (begin c d))');
