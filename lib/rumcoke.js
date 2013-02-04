var util = require("util"),
    Parser = require('./rumcoke/parser'), 
    Translator = require('./rumcoke/translator');

function convert(txt){
  var exprs = this.Parser.parser.parse(txt);
  var js = this.Translator.translate(exprs);

  return js;
};

module.exports = {
  Parser: Parser,
  Translator: Translator,
  convert: convert
};
