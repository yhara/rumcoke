build: _translator.js

_translator.js: translator.js translator.rmk parser.js
	./rumcoke translator.rmk > _translator.js

parser.js: parser.jison
	jison parser.jison -o /tmp/parser.js
	# Add header for github (hide diff)
	echo "// Generated by Jison" > parser.js
	cat /tmp/parser.js >> parser.js

accept: _translator.js
	cp _translator.js translator.js

debug: _translator.js
	./rumcoke a.rmk --debug

test: _translator.js
	node test.js --debug
