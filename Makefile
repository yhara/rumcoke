DEBUG_BUILD_FILES = \
	debug/rumcoke/parser.js \
	debug/rumcoke/translator.js

default: $(DEBUG_BUILD_FILES)

debug/rumcoke/parser.js: debug/rumcoke.js lib/rumcoke/parser.jison
	jison lib/rumcoke/parser.jison -o debug/rumcoke/parser.js

debug/rumcoke/translator.js: lib/rumcoke/translator.rmk 
	./bin/rumcoke lib/rumcoke/translator.rmk > debug/rumcoke/translator.js

debug/rumcoke.js: lib/rumcoke.js
	cp -r lib/ debug/

accept: $(DEBUG_BUILD_FILES)
	node test.js --debug && \
	  cp debug/rumcoke/translator.js lib/rumcoke/translator.js && \
	  echo "// Generated by Jison" > lib/rumcoke/parser.js && \
	  cat debug/rumcoke/parser.js >> lib/rumcoke/parser.js

debug: $(DEBUG_BUILD_FILES)
	./bin/rumcoke a.rmk --debug

test: $(DEBUG_BUILD_FILES)
	node test.js --debug
