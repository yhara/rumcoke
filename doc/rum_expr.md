Rum-Expression
==============

Note: This document should be revised.

----

Lisp program is constructed with S-Expression.
Similarly, RumCoke program is constructed with Rum-Expression.

This is a Scheme program.

    (define x 1)

S-Expression is constructed with cons-cells, symbols, numbers, etc.

    car       cdr
    [<define>][ ]-->[<x>][ ]-->[1][nil]
        
This is a RumCoke program.

    (define x 1)

Rum-Expression is represented with JavaScript object.

    [Sym("define"), Sym("x"), 1]

This document describes:

* 

Symbol
------

Symbols are represented as an instance of Sym.
(TODO: Move parser.Sym to RumCoke.Sym)

    x

    Sym("x")

Array
-----

Rum-Expression does not have list. Only array.

    (a b c)

    [Sym("a"), Sym("b"), Sym("c")]

String
------

Strings are represented as JavaScript String.

    "foo"

    "foo"

Number
------

Numbers are represented as JavaScript number.

    1

    1

Boolean
-------

    (#t #f #null #undefined)

    [true, false, null, (void 0)]

Note: RumCoke compiles `#undefined` into `void 0`.
Since `undefined` is a variable in JavaScript,
`void 0` is a better way to get 'the original' undefined value.

Regexp
------

    #/foo/

    /foo/

Object
------

    (foo: 1 bar: 2)

    {"foo": 1, "bar": 2, "rumExpr": true}

<!--
  Other kinds of objects
  ----------------------

  JavaScript has many kinds of objects 
  You cannot 

  However, it is possible

      (define-macro (id x)
        x)

      (define-macro (m)
        (new Date))

      (id m)
-->
