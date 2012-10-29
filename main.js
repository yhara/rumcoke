util = require("util");
parser = require("./parser").parser;

exprs = parser.parse('(define util (require "util"))');
//console.log(JSON.stringify(exprs, null, 2))
util.puts(util.inspect(exprs, false, null, true));
util.puts("--");

function write(s) {
  util.print(s);
}

//function convert(exprs) {
//  switch(exprs[0]) {
//    case "true": write("true"); break;
//    case "false": write("false"); break;
//    case "number": write(exprs[1]); break;
//    case "list":
//      var items = exprs[1];
//      var first = items[0];
//      if (first[0] == "ident") {
//        switch(first[1]){
//          case "define":
//        }
//      }
//    default:
//      break;
//  }
//}
//
//convert(exprs);
