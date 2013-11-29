Examples
========

aobench
-------

https://code.google.com/p/aobench/

* ambientocclusion.js : original code
* aobench.rmk : RumCoke port
* aobench_node.js : aobench.rmk compiled to JS

How to run:

    $ cd example/
    $ ../bin/rumcoke aobench.rmk > a.js
    $ node a.js > image.ppm
    Time: 1.115
    $ convert image.ppm image.png    # Convert with Imagemagick
