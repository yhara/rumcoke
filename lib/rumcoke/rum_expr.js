// Symbols
function Symbol(name){
  this.name = name;
  this.jsName = name.replace(/[-](\w)/g, function(match, c){
      return c.toUpperCase();
    }).replace(/^(\w)(.*)\?$/, function(match, c, rest){
      return "is" + c.toUpperCase() + rest;
    });
}

Symbol.prototype.toString = function(){
  return "'" + this.name;
};
Symbol.prototype.inspect = function(depth){
  return "'" + this.name;
};

var Symbols = {};
function Sym(name){
  var found = Symbols[name];
  if (found) {
    return found;
  }
  else {
    return (Symbols[name] = new Symbol(name));
  }
};

var isSymbol = function(x){ return x instanceof Symbol; };

// Object expression
function ObjExpr(content){
  this.content = content;
};

function isObjExpr(x){
  return x instanceof ObjExpr;
};

module.exports = {
  Symbol: Symbol,
  Symbols: Symbols,
  Sym: Sym,
  isSymbol: isSymbol,
  ObjExpr: ObjExpr,
  isObjExpr: isObjExpr
};
