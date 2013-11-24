Syntax
======

(See parser.jison for strict syntax) 

## program

A program is list of expressions.

## expressions

### ident

variable reference

### boolean

`#t` `#f` `#null` `#undefined`

### number

123

### string

`"foo"` (Unlike JavaScript, `'foo'` is not allowed)

May contain `\'` `\"` `\b` `\f` `\n` `\r` `\t` `\v` `\\`

### regexp

`#/foo/`

### vector

`#(1 2 3)`

### array

`(1 2 3)`

### object

`(a: 1)`

### property reference

`x.y.z`

This can be left hand side of `set!`

    (set! x.y.z 1)

### quote

`'foo`

`'(a b c)`

### quasiquote

    `(a ,b ,@c)

