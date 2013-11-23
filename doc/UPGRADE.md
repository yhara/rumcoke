Incompatible changes
====================

RumCoke is in early development stage.

0.1.0 to 0.1.1
--------------

Removed syntax `{}`. Use `(new Object)` instead

0.0.4 to 0.1.0
--------------

Changed syntax to describe JS null and JS undefined

    before:

      (define a null)
      (define b undefined)

    after:

      (define a #null)
      (define b #undefined)
