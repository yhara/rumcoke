# Reference

## Comment

Use `;` for one-line comment.

    ; This line is a comment

## Variable

### Defining varibale

    (define x 1)   ;=>  var x = 1;

    (define (f x) (+ x 1))   ;=> var f = function(x){ return x + 1; }

### Assignment

    (set! x 1)     ;=> x = 1;

    (aset! ary 0 1)  ;=> ary[0] = 1;
    (aset! x key 1)  ;=> x[key] = 1
    (aset! x.y 1)    ;=> x.y = 1

    (inc! x)         ;=> x++;
    (dec! y)         ;=> y--;

### Naming rules

Unlike JS, `-` and `?` are allowed for identifier.

Identifiers with `-` are converted to lowerCamelCase in JS.

    (do-something)   ;=> doSomething()

Trailing `?` is converted to isXXX in JS.

    (monday? x)    ;=> isMonday(x)

This naming convention is especially useful with [underscore.js](http://underscorejs.org/):

    (_.array? x)   ;=> _.isArray(x)

## Types

### Number

    1       ;=> 1
    1.1     ;=> 1.1

### String

    "foo"   ;=> "foo"

### Boolean

    #t           ;=> true
    #f           ;=> falsef
    #null        ;=> null
    #undefined   ;=> void 0

Note: `void 0` is a JavaScript idiom to get `undefined`, even if 
there is a variable named `undefined`.

### Array

    (array 1 2 3)   ;=> [1, 2, 3]
    '(1 2 3)        ;=> [1, 2, 3]

    (~ ary 0)       ;=> ary[0]

    (aset! ary 0 1) ;=> ary[0] = 1;

### Function

    (define (f x)
      (+ x 1))
    ;=> var f = function(x){ return x + 1; }

    (^(x) (+ x 1))
    ;=> function(x){ return x + 1; }


    (define (f x)
      (do-something)
      #undefined)

### Object

    (a: 1 b: 2)           ;=> {a: 1, b: 2}

    (new Date 2013 1 1)   ;=> new Date(2013, 1, 1);

    (.. obj foo)          ;=> obj.foo  (property access)

    (.. obj foo bar)      ;=> obj.foo.bar  (successive property access)

    (.. obj (foo bar))    ;=> obj.foo(bar)   (method call)

## Operators

    (+ x y)    ;=> x + y
    (- x y)    ;=> x - y
    (* x y)    ;=> x * y
    (/ x y)    ;=> x / y

    (= x y)    ;=> x === y
    (< x y)    ;=> x < y
    (<= x y)   ;=> x <= y
    (> x y)    ;=> x > y
    (>= x y)   ;=> x >= y

    (and x y)  ;=> x && y
    (or x y)   ;=> x || y
    (not x)    ;=> !x

    (instance? x String)   ;=> x instanceof String

## Conditionals

### if [special form]

    (if x y z)

Value: y or z

    (if foo
      (do-something))
    ;=> if(foo){ do_something(); }

1-clause if is allowed in RumCoke (although using `when` is preferred for
this case).

Value: 1-clause if does not have a value

Use `begin` when you want to write more than one expressions in either 
clause.

    (if (= x 1)
      (begin
        (task1)
        (task2))
      (begin
        (task3)
        (task4)))

### when, unless [macro]

    (when x
      ...)

    (unless y
      ...)

These are compiled to 1-clause if (`if` without `else`), so these does not
have value.

### cond [macro]

    (cond
      (monday? (work))
      (sunday? (sleep))
      (else (throw "error")))
    ;=> Converted to successive if-then-else

### case [special form]

    (case x
      ((1) (print "one"))
      ((2 3) (print "two or three"))
      (else (print "other")))
    ;=> Converted to JS switch-case-default

Value: last value of each clause

## Loop

### while [special form]

    (while expr
      body...)

`while` does not have a value.

### for (deprecated) [special form]

    (for (set! j 0) (< j nphi) (inc! j)
    ;=> for(j=0; j<nphi; j++)

`for` does not have a value.

Note: Current definition of `for` cannot express `for(a=1, b=2; ...)`
and it will be replaced with `do` in future version.

### break [special form]

    (break)    ;=> break;

TODO: Do we need break with label?

`break` does not have a value.

## Exception

### throw [special form]

    (throw x)  ;=> throw x;

`throw` does not have a value.

### try

(TBA)

## Quoting

### quote [macro]

    (quote a)   ;=> Sym("a")
    'a          ; same as (quote a)

### quasiquote [macro]

    (define a '(1 2))
    (define b '(3 4))
    (define c '(5 6))

    (quasiquote a (unquote b) (unquote-splicing c))
    ;=> (a (3 4) 5 6)

    `(a ,b ,@c)
    ;=> (a (3 4) 5 6)

## Misc.

### raw-js-ast [special form]

Used internally

    (raw-js-ast (type: "Literal" value: 7))  ;=> 7

## TODO

* mod?
* `&` `|` `^` `~` `<<` `>>` `>>>`
  (In R6RS they are named bitwise-and, -ior, -xor, -not, bitwise-arithmetic-shift-left, -right. R6RS seems not to have `>>>`)
* `case` (Convert to `switch`. Currently a macro, but should be a special-form)
* `return` `continue`
* `try .. catch`

* `this` (Currently handled as variable reference, but should be ThisExpression)

## Not supported

* `with`
