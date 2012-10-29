/* -- JavaScript code -- */
%{

function Symbol(name){
  this.name = name;
}
Symbol.prototype.toString = function(){
  return "'" + this.name;
};
Symbol.prototype.inspect = function(depth){
  return "<" + this.name + ">";
};
var Symbols = {};
Sym = function(name){
  var found = Symbols[name];
  if (found) {
    return found;
  }
  else {
    return (Symbols[name] = new Symbol(name));
  }
};
exports.Sym = Sym;
exports.Symbol = Symbol;

%}

/* -- Lex -- */

%lex
%%

\s+ /* skip whitespace */
"#("  return "#(";
"#t"  return "#t";
"#f"  return "#f";
"null" return "null";
"undefined" return "undefined";
"{}"  return "{}";
"("   return "(";
")"   return ")";
"+"   return "+";
"-"   return "-";
"*"   return "*";
"/"   return "/";
"%"   return "%";
[._a-zA-Z][._a-zA-Z0-9]*"!"?  return "IDENT";
[0-9]+("."[0-9]+)?\b  return "NUMBER";
'"'[^"]*'"'           return "STRING";
"#/"[^/]*"/"          return "REGEXP";
<<EOF>>   return "EOF";

/lex

/* -- Grammer -- */

%start program
%%

program
  : exprs EOF 
    { return $$; }
  ;

exprs
  : /* none */
    { $$ = []; }
  | exprs expr
    { $$ = $exprs; $$.push($expr); }
  ;

expr
  : literal
  | array
  ;

literal
  : ident
  | boolean
  | number
  | string
  | regexp
  | emptyobj
  | vector
  ;

ident
  : IDENT { $$ = Sym(yytext); }
  ;

boolean
  : "#t" { $$ = true; }
  | "#f" { $$ = false; }
  | "null" { $$ = null; }
  | "undefined" { $$ = undefined; }
  ;

number
  : NUMBER { $$ = Number(yytext); }
  ;

string
  : STRING { $$ = yytext.slice(1, -1); }
  ;

regexp
  : REGEXP { $$ = new RegExp(yytext.slice(1, -1)); }
  ;

emptyobj
  : "{}" { $$ = {}; }
  ;

vector
  : "#(" exprs ")" { $$ = ["vector", $2]; }
  ;

array
  : "(" exprs ")" { $$ = $2; }
  ;
