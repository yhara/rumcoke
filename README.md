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
  * '(1 2 3) is an array, not list
* quasiquote

TODO

* Lisp style macro
* Source Map

Example
-------

Hello World

    (console.log "Hello, world!")

Requirements
------------

Node.js (tested with v0.10.20)

Install
-------

    $ git clone https://github.com/yhara/rumcoke
    $ npm install
    $ make
    $ ./bin/rumcoke hello.rmk | node
    Hello, world!

Documents
---------

See [doc/index.md](https://github.com/yhara/rumcoke/blob/master/doc/index.md)

Cheat Sheet
-----------

Naming rules

* `convert-defvar` => `convertDefvar`
* `array?` => `isArray`

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
* `(a: 1)` => `{a: 1}`
* `("a?": 1)` => `{"a?": 1}`

Operator

* `(= x y)` => `x === y`
* `(not (= x y))` => `x !== y`
* `(instance? x Date)` => `x instanceof Date`

Exception

* `(throw "err")` => `throw("err");`

Underscore.js

  (define _ (require "underscore"))
  (util.puts (util.inspect (\_.map (array 1 2 3)
                                   (^(x) (* x 2)))))

See translator.rmk for more.

Development
-----------

RumCoke is a self-hosted compiler, so you need a working RumCoke compiler
to compile translator.rmk. For this purpose lib/rumcoke/translator.js is
commited in repository. 

When you run `make`, it will build translator.js under debug/, so that
we always have 'previous working version' in a working copy. `make accept`
will copy this debug build to lib/.

1. modify parser or translator

2. Run test

    $ make test    ;=> OK if no error is shown

3. Run `make accept` to build lib/*

4. Commit

### Tips

Sometimes you find bug in the 'previous woking version'. This case is pretty
complecated because you are editing translator.rmk but there is a bug in
another position of translator.rmk.

In this case, you should:

1. Stop developing the new feature 
2. Make a minimal case to reproduce the error (save it in a.rmk)
3. `git stash` and fix the bug first

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
