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
var Sym = function(name){
  var found = Symbols[name];
  if (found) {
    return found;
  }
  else {
    return (Symbols[name] = new Symbol(name));
  }
}

%}

/* -- Lex -- */

%lex
%%

\s+ /* skip whitespace */
"#("  return "#(";
"#t"  return "#t";
"#f"  return "#f";
"("   return "(";
")"   return ")";
"+"   return "+";
"-"   return "-";
"*"   return "*";
"/"   return "/";
"%"   return "%";
[a-zA-Z][a-zA-Z0-9]*  return "IDENT";
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
  | vector
  ;

ident
  : IDENT { $$ = Sym(yytext); }
  ;

boolean
  : "#t" { $$ = ["true"]; }
  | "#f" { $$ = ["false"]; }
  ;

number
  : NUMBER { $$ = ["number", Number(yytext)]; }
  ;

string
  : STRING { $$ = yytext.slice(1, -1); }
  ;

regexp
  : REGEXP { $$ = ["regexp", yytext]; }
  ;

vector
  : "#(" exprs ")" { $$ = ["vector", $2]; }
  ;

array
  : "(" exprs ")" { $$ = $2; }
  ;
