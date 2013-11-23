/* -- JavaScript code -- */
%{

var RumExpr = require('./rum_expr');
var Sym = RumExpr.Sym;

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

"<="            return "IDENT";
">="            return "IDENT";
[-+*/<>%=^\|~]  return "IDENT";
".."  return "IDENT";
{rmk_ident}"."{rmk_ident}         return "PROPREF";
{js_ident}*":"                   return "KEYWORD";
'"'[^"]*'":'                     return "STR_KEYWORD";
{rmk_ident}                      return "IDENT";
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
  | vector
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
  : NUMBER { $$ = Number(yytext); }
  ;

string
  : STRING {
      $$ = yytext.slice(1, -1)
             .replace(/(^|[^\\])\\'/, "'")
             .replace(/(^|[^\\])\\"/, '"')
             .replace(/(^|[^\\])\\b/, "\b")
             .replace(/(^|[^\\])\\f/, "\f")
             .replace(/(^|[^\\])\\n/, "\n")
             .replace(/(^|[^\\])\\r/, "\r")
             .replace(/(^|[^\\])\\t/, "\t")
             .replace(/(^|[^\\])\\v/, "\v")
             .replace(/\\\\/, "\\");
    }
  ;

regexp
  : REGEXP { $$ = new RegExp(yytext.slice(2, -1)); }
  ;

vector
  : "#(" exprs ")" { $$ = ["vector", $2]; }
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

propref
  : PROPREF
    { var _tmp = yytext.match(/(.+)\.(.+)/);
      $$ = [Sym(".."), Sym(_tmp[1]), Sym(_tmp[2])]; }
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
