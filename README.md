RumCoke - JavaScript in Scheme syntax
=====================================

RumCoke is a programming language with lisp-like syntax and
translated into JavaScript.
It is like CoffeeScript based on S-Expression.

### Current state

Experimental (just started)

Features
--------

* Traslated into (relatively) readable JavaScript 
* Scheme-like syntax
* Array based s-expression
  * (1 2 3) is an array, not list

TODO

* quasiquote
* Lisp style macro
* Source Map

Example
-------

Hello World

    (define util (require "util"))
    (util.puts "Hello, world!")

Requirements
------------

Node.js (tested with v0.8.14)

Usage
-----

    $ git clone https://github.com/yhara/rumcoke
    $ npm install
    $ ./node_modules/jison/lib/jison/cli-wrapper.js parser.jison
    $ ./rumcoke hello.rmk | node
    Hello, world!

Run test
--------

    $ make test    ;=> OK if no error is shown

Documents
---------

See [doc/index.md](https://github.com/yhara/rumcoke/blob/master/doc/index.md)

Cheat Sheet
-----------

Variable

* `(define a 1)` => `var a=1;`
* `(set! x 1)` => `x = 1;`

Property
* `(~ ary 0)` => `ary[0]`
* `obj.foo` => `obj.foo`
* `(aset! obj "foo" 1)` => `obj.foo = 1;`
* cf. `(aset! obj foo 1)` => `obj[foo] = 1;`

Function

* `(define (f x) x)` => `var f = function(x){ return x; }`
* `(^(x) (+ x 1))` => `function(x){ return x + 1; }`
* `(obj.foo 1 2 3)` => `obj.foo(1, 2, 3);`

Literal

* `#t` => `true`
* `#f` => `false`
* `123` => `123`
* `"foo"` => `"foo"`
* `(array 1 2 3)` => `[1, 2, 3]`
* `(array)` => `[]`

Operator

* `(= x y)` => `x === y`
* `(not (= x y))` => `x !== y`

Exception

* `(throw "err")` => `throw("err");`

Underscore.js

  (define _ (require "underscore"))
  (util.puts (util.inspect (\_.map (array 1 2 3)
                                   (^(x) (* x 2)))))

See translator.rmk for more.

TODO
* for, while
* try-catch

Why?
----

* An experiment to make a sexp-based CoffeeScript
  * JavaScript and Scheme are both lisp-2, have 1st-class functions, ... 

* An experiment to make an array-based lisp (not list)
  * So there is no 'Dot pair' in RumCoke

* Wanted to make a self-hosted programming language

* I am author of [BiwaScheme](http://www.biwascheme.org/),
  a Scheme interpreter written in JavaScript, and envious of
  languages that translated into JavaScirpt (such as JSX, TypeScript, Haxe).
  They are sometimes even faster than hand-written JavaScript.

License
-------

MIT

Contact
-------

https://github.com/yhara/rumcoke

Yutaka HARA (yhara)

twitter: [@yhara_en](https://twitter.com/yhara_en)
