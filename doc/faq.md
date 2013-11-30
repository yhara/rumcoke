FAQ
===

Why RumCoke does not have List?

* It's a matter of choise. There is no technical reason it cannot have List.
* Just wanted to see a Lisp based on Array.
* JavaScript does not have List, so nor RumCoke.

Why RumCoke has Symbol in addition to String?

* In s-expression, a symbol denotes variable reference and a string denotes a value.
  To distinguish variable reference and string value, rum-expression must have Symbol too.

What is the difference between 'special form' and 'macro'?

* Macro calls (like `(when x y)`) are translated into special forms
  (like `(if x y)`).
  So, for example, when you write a macro that traverses the given
  program and do some analysis, you only need to care about special forms
  (eg. `if`), not including macros (eg. `when`).

  From this point, special forms are considered to be 'core' of the language.
