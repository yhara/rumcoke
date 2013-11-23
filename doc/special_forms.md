Special forms
=============

`define`
--------

    (define x 1)

    (define (f x) (+ x 1))

`^`
---

    (^(x) (+ x 1))

`..`
----

    (.. obj foo)  ;=> obj.foo

    (.. obj foo bar)  ;=> obj.foo.bar

    (.. obj (foo bar))  ;=> obj.foo(bar)

Note: I feel this is cryptic :-(

`set!`
------

    (set! x 1)  ;=> x = 1

`aset!`
-------

    (aset! x "foo" 1)  ;=> x["foo"] = 1


Note: maybe `(set! x.foo 1)` and `(set! x[key] 1)` are better?

`~`
---

    (~ ary 0)  ;=> ary[0]

`new`
-----

    (new Date 2013 1 1)  ;=> new Date(2013, 1, 1);

`array`
-------

Like `list` in Lisp. Converted to JS array literal

    (array 1 2 3)  ;=> [1,2,3]

`=`
---

Converted to JS `===`

    (= x y)  ;=> x === y


`if`
----

    (if x y z)

`begin`
-------

    (if x
      (begin (f) (g))
      (begin (h) (i)))

`and`, `or`, `not`
------------------

    (and x y)  ;=> x && y
    (or x y)   ;=> x || y
    (not x)    ;=> !x

`while`
-------

    (while expr
      body...)

`break`
-------

    (break)    ;=> break;

TODO: Do we need break with label?

`throw`
-------

    (throw x)  ;=> throw x;

`instance?`
-----------

    (instance? x String)   ;=> x instanceof String

`raw-js-ast`
------------

(Used internally)

    (raw-js-ast (type: "Literal" value: 7))  ;=> 7


Predefined macros
=================

`instance?`
-----------

    (instance? x y)   ;=> x instanceof y


TODO
====

* `&` `|` `^` `~` `<<` `>>` `>>>`
  (In R6RS they are named bitwise-and, -ior, -xor, -not, bitwise-arithmetic-shift-left, -right. R6RS seems not to have `>>>`)
* `case` (Convert to `switch`. Currently a macro, but should be a special-form)
* `return` `continue`
* `try .. catch`
* `inc!`, `dec!` (`++`, `--`)

* `for`? (Do you need it?)

* `this` (Currently handled as variable reference, but should be ThisExpression)

Not supported
=============

* `with`
