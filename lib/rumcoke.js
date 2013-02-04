var util = require("util"),
    Parser = require('./rumcoke/parser'), 
    Translator = require('./rumcoke/translator'),
    VERSION = require('./rumcoke/version');

function convert(txt){
  var exprs = this.Parser.parser.parse(txt);
  var js = this.Translator.translate(exprs);

  return js;
};

module.exports = {
  VERSION: VERSION,
  Parser: Parser,
  Translator: Translator,
  convert: convert
};
