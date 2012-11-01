/* -- JavaScript code -- */
%{

function Symbol(name){
  this.name = name;
  this.jsName = name.replace(/[-](\w)/g, function(match, c){
      return c.toUpperCase();
    }).replace(/\?$/, "p");
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

digit [0-9]
alpha [a-zA-Z]
alpha_ [a-zA-Z_]
alnum [a-zA-Z0-9]
alnum_ [a-zA-Z0-9_]

%%

\s+     /* skip whitespace */
";".*   /* comment */
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
"="   return "IDENT";
".."  return "IDENT";
{alpha_}{alnum_}*":"              return "KEYWORD";
{alpha_}[-_a-zA-Z0-9]*[!\?]?     return "IDENT";
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
  : ident
  | boolean
  | number
  | string
  | regexp
  | emptyobj
  | vector
  | array
  | object
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
  : REGEXP { $$ = new RegExp(yytext.slice(2, -1)); }
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

object
  : "(" properties ")" { $$ = $2; }
  ;

properties
  : keyword expr
    { $$ = {}; $$[$1] = $2; }
  | properties keyword expr
    { $$ = $1; $$[$2] = $3; }
  ;

keyword
  : KEYWORD { $$ = yytext.slice(0, -1); }
  ;
