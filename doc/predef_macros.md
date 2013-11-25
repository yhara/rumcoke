Predefined macros
=================

quote
-----

    (quote a)   ;=> Sym("a")
    'a          ; same as (quote a)


cond
----

    (cond
      (monday? (work))
      (sunday? (sleep))
      (else (throw "error")))
    ;=> Converted to successive if-then-else

when
----

    (when x
      ...)

unless
------

    (unless y
      ...)

quasiquote
----------

    (define a '(1 2))
    (define b '(3 4))
    (define c '(5 6))

    (quasiquote a (unquote b) (unquote-splicing c))
    ;=> (a (3 4) 5 6)

    `(a ,b ,@c)
    ;=> (a (3 4) 5 6)
