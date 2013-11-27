Special forms
=============

`define`
--------

    (define x 1)

    (define (f x) (+ x 1))

Value: Currently, definitions does not have value (may change in the future).

`^`
---

    (^(x) (+ x 1))  ;=> function(x){ return x+1; }

Value: JS function

`..`
----

    (.. obj foo)  ;=> obj.foo

    (.. obj foo bar)  ;=> obj.foo.bar

    (.. obj (foo bar))  ;=> obj.foo(bar)

Note: I feel this is cryptic :-(

Value: result of property reference or method call

`set!`
------

    (set! x 1)  ;=> x = 1

Value: the updated value

`aset!`
-------

    (aset! x.y 1)  ;=> x.y = 1
    (aset! x key 1)  ;=> x[key] = 1

Value: the updated value

`~`
---

    (~ ary 0)  ;=> ary[0]

Value: result of array/object indexing

`new`
-----

    (new Date 2013 1 1)  ;=> new Date(2013, 1, 1);

Value: newly created JS object

`array`
-------

Like `list` in Lisp. Converted to JS array literal

    (array 1 2 3)  ;=> [1,2,3]

Value: JS array

`=`
---

Converted to JS `===`

    (= x y)  ;=> x === y

Value: boolean

`if`
----

    (if x y z)

Value: y or z

    (if foo
      (do-something))
    ;=> if(foo){ do_something(); }

1-clause if is allowed in RumCoke (although using `when` is preferred for
this case).

Value: 1-clause if does not have a value

`case`
------

    (case x
      ((1) (print "one"))
      ((2 3) (print "two or three"))
      (else (print "other")))
    ;=> Converted to JS switch-case-default

Value: last value of each clause

`begin`
-------

    (if x
      (begin (f) (g))
      (begin (h) (i)))

Value: last value in `begin`

`and`, `or`, `not`
------------------

    (and x y)  ;=> x && y
    (or x y)   ;=> x || y
    (not x)    ;=> !x

Value: result of logical operation

`while`
-------

    (while expr
      body...)

`while` does not have a value.

`for`
-----

    (for (set! j 0) (< j nphi) (inc! j)
    ;=> for(j=0; j<nphi; j++)

`for` does not have a value.

`break`
-------

    (break)    ;=> break;

TODO: Do we need break with label?

`break` does not have a value.

`throw`
-------

    (throw x)  ;=> throw x;

`throw` does not have a value.

`instance?`
-----------

    (instance? x String)   ;=> x instanceof String

Value: boolean

`raw-js-ast`
------------

(Used internally)

    (raw-js-ast (type: "Literal" value: 7))  ;=> 7

operators
---------

`+` `-` `*` `/`

`<` `<=` `>` `>=`

`inc!`(`++`) `dec!`(`--`)

Predefined macros
=================

`instance?`
-----------

    (instance? x y)   ;=> x instanceof y


TODO
====

* mod?
* `&` `|` `^` `~` `<<` `>>` `>>>`
  (In R6RS they are named bitwise-and, -ior, -xor, -not, bitwise-arithmetic-shift-left, -right. R6RS seems not to have `>>>`)
* `case` (Convert to `switch`. Currently a macro, but should be a special-form)
* `return` `continue`
* `try .. catch`

* `this` (Currently handled as variable reference, but should be ThisExpression)

Not supported
=============

* `with`
