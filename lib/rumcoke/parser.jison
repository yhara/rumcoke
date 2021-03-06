/* -- JavaScript code -- */
%{

//var _ = require("underscore");
var RumExpr = require('./rum_expr');
var Sym = RumExpr.Sym;

// Returns a string where "\\n" is replaced to "\n", etc. 
function substituteEscapes(str){
  return str.replace(/(^|\b|[^\\])\\'/g, "$1'")
            .replace(/(^|\b|[^\\])\\"/g, '$1"')
            .replace(/(^|\b|[^\\])\\b/g, "$1\b")
            .replace(/(^|\b|[^\\])\\f/g, "$1\f")
            .replace(/(^|\b|[^\\])\\n/g, "$1\n")
            .replace(/(^|\b|[^\\])\\r/g, "$1\r")
            .replace(/(^|\b|[^\\])\\t/g, "$1\t")
            .replace(/(^|\b|[^\\])\\v/g, "$1\v")
            .replace(/\\\\/g, "\\");
}

%}

/* -- Lex -- */

%lex

digit [0-9]
alpha [a-zA-Z]
alpha_ [a-zA-Z_]
alpha_d [a-zA-Z_\$]
alnum [a-zA-Z0-9]
alnum_ [a-zA-Z0-9_]
alnum_d [a-zA-Z0-9_\$]
js_ident {alpha_d}{alnum_d}*
rmk_ident {alpha_d}[-_a-zA-Z0-9\$]*[\!\?]?

/* Define exclusive start conditon for multi-line comment */
%x ML_COMMENT
%%

<INITIAL>"#|"           this.begin("ML_COMMENT");
<ML_COMMENT>[^\|]+      /* skip until | */
<ML_COMMENT>"|"[^#]     /* skip unless |# */
<ML_COMMENT>"|#"        this.begin("INITIAL");

\s+     /* skip whitespace */
";".*   /* comment */
"#|"(.|.)*"|#"  /* comment */
"#("  return "#(";
"#t"  return "#t";
"#f"  return "#f";
"#null" return "#null";
"#undefined" return "#undefined";
"("   return "(";
")"   return ")";

"'"   return "'";
"`"   return "`";
",@"  return ",@";
","   return ",";

[0-9]+("."[0-9]+)?\b     return "POSITIVE_NUMBER";
"-"[0-9]+("."[0-9]+)?\b  return "NEGATIVE_NUMBER";
"<="            return "IDENT";
">="            return "IDENT";
[-+*/<>%=^\|~]  return "IDENT";
".."  return "IDENT";
{rmk_ident}("."{rmk_ident})+         return "PROPREF";
{js_ident}*":"                   return "KEYWORD";
'"'[^"]*'":'                     return "STR_KEYWORD";
{rmk_ident}                      return "IDENT";
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
  | array
  | object
  | propref

  | quoted
  | quasiquote
  | unquote
  | unquote_splicing
  ;

ident
  : IDENT { $$ = Sym(yytext); }
  ;

boolean
  : "#t" { $$ = true; }
  | "#f" { $$ = false; }
  | "#null" { $$ = null; }
  | "#undefined" { $$ = undefined; }
  ;

number
  : POSITIVE_NUMBER { $$ = Number(yytext); }
  | NEGATIVE_NUMBER { $$ = [Sym("-"), -Number(yytext)]; }
  ;

string
  : STRING { $$ = substituteEscapes(yytext.slice(1, -1)); }
  ;

regexp
  : REGEXP { $$ = new RegExp(yytext.slice(2, -1)); }
  ;

array
  : "(" exprs ")" { $$ = $2; }
  ;

object
  : "(" properties ")" { $$ = new RumExpr.ObjExpr($2); }
  ;

  properties
    : keyword expr
      { $$ = {}; $$[$1] = $2; }
    | properties keyword expr
      { $$ = $1; $$[$2] = $3; }
    ;

  keyword
    : KEYWORD { $$ = yytext.slice(0, -1); }
    | STR_KEYWORD { $$ = yytext.slice(1, -2); }
    ;

// x.y
// x.y.z
propref
  : PROPREF
    { var _tmp = yytext.split(/\./).map(Sym);
      $$ = [Sym("..")].concat(_tmp); }
  ;

quoted
  : "'" expr
    { $$ = [Sym("quote"), $2]; }
  ;

quasiquote
  : "`" array
    { $$ = [Sym("quasiquote"), $2]; }
  ;

unquote
  : "," expr
    { $$ = [Sym("unquote"), $2]; }
  ;

unquote_splicing
  : ",@" expr
    { $$ = [Sym("unquote-splicing"), $2]; }
  ;
