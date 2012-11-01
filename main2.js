// Using Escodegen https://github.com/Constellation/escodegen

var util = require("util"),
    fs = require("fs"),
    _ = require("underscore"),
    escodegen = require("escodegen");

Parser = require("./parser");
parser = Parser.parser;
isSymbol = function(x){
  return x instanceof Parser.Symbol;
}

exprs = parser.parse(fs.readFileSync("rum_main.rmk", "utf8"));

//util.puts(util.inspect(exprs, false, null, true));
//util.puts("--");

function raise(msg, info){
  info || (info = {});
  info["ERROR"] = msg;
  throw util.inspect(info);
}

function raiseIf(cond, msg, info){
  if (cond) { raise(msg, info) }
}

function ast(typename, info){
  info["type"] = typename;
  return info;
}

function convertDefvar(left, rest){
  if (rest.length === 0) 
    var init = null;
  else if (rest.length === 1)
    var init = convertValue(rest[0]);
  else
    raise("malformed defvar", {left:left, rest:rest});

  return ast("VariableDeclaration", {
      kind: "var",
      declarations: [
        ast("VariableDeclarator", {
          id: convertNode(left),
          init: init
        })
      ]
    });
}

// wrap with (function(){ ... })();
function wrapWithFunctionCall(innerAst){
  return ast("CallExpression", {
    arguments: [],
    callee: ast("FunctionExpression", {
      params: [],
      defaults: [],
      body: ast("BlockStatement", {body: [statementExpr(innerAst)]})
    })
  });
};

function statementExpr(innerAst){
  if (innerAst.type.match(/Expression$/))
    return ast("ExpressionStatement", {expression: innerAst});
  else
    return innerAst;
}

function convertStmt(v){
  return statementExpr(convertNode(v));
}

function convertDefun(left, rest){
  var fname = left[0], params = left.slice(1);
  raiseIf(!isSymbol(fname), "malformed defun");

  var func = ast("FunctionExpression", {
      params: params.map(function(param){
        raiseIf(!isSymbol(param), "malformed param");
        return convertNode(param)
      }),
      defaults: [],
      body: ast("BlockStatement", {
              body: rest.map(function(bodyItem, idx){
                      if (idx == rest.length-1) {
                        return ast("ReturnStatement", {
                            argument: convertValue(bodyItem)
                          })
                      }
                      else {
                        return convertStmt(bodyItem);
                      }
                    })
            })
    });

  return ast("VariableDeclaration", {
      kind: "var",
      declarations: [
        ast("VariableDeclarator", {
          id: convertNode(fname),
          init: func
        })
      ]
    });
}

var syntaxes = {
  define: function(v){
    var left = v[1], rest = v.slice(2);
    if (isSymbol(left))
      return convertDefvar(left, rest);
    else if (_.isArray(left))
      return convertDefun(left, rest);
    else
      raise("malformed define", {left:left, rest:rest});
  },

  "..": function(v){
      var receiver = v[1], callSpecs = v.slice(2);
      return callSpecs.reduce(function(acc, callSpec){
        if (isSymbol(callSpec)){
          return ast("MemberExpression", {
              computed: false,
              object: acc,
              property: convertNode(callSpec)
            });
        }
        else if(_.isArray(callSpec)){
          raiseIf(!isSymbol(callSpec[0]), "malformed ..",
            {expected: "Symbol", given: callSpec[0]})
          return ast("CallExpression", {
              callee: ast("MemberExpression", {
                  computed: false,
                  object: acc,
                  property: convertNode(callSpec[0])
                }),
              arguments: callSpec.slice(1).map(convertValue)
            });
        }
        else
          raise("malformed ..", {receiver: receiver, callSpec: callSpec,
                                 callSpecs: callSpecs});
      }, convertValue(receiver));
  },

  "instance?": function(v){
    return ast("BinaryExpression", {
        operator: "instanceof",
        left: convertValue(v[1]),
        right: convertValue(v[2])
      });
  },

  "set!": function(v){
    // TODO: syntax check
    return ast("AssignmentExpression", {
        operator: "=",
        left: convertNode(v[1]), 
        right: convertValue(v[2])
      });
  },

  "aset!": function(v){
    // TODO: syntax check
    // TODO: successive aset (a[b][c] = d)
    return ast("AssignmentExpression", {
        operator: "=",
        left: ast("MemberExpression", {
            computed: true,
            object: convertValue(v[1]), 
            property: convertNode(v[2])
          }),
        right: convertValue(v[3])
      });
  },

  "aref": function(v){
    // TODO: successive aref
    raiseIf(v.length !== 3, "malformed aref");
    return ast("MemberExpression", {
      computed: true,
      object: convertValue(v[1]),
      property: convertValue(v[2])
    });
  },

  "array": function(v){
    return ast("ArrayExpression", {
      elements: v.slice(1).map(convertValue)
    });
  },

  "=": function(v) {
    raiseIf(v.length !== 3, "malformed =");
    return ast("BinaryExpression", {
      operator: "===",
      left: convertValue(v[1]),
      right: convertValue(v[2])
    });
  },

  "if": function(v, valueNeeded){
    if (valueNeeded) {
      return ast("ConditionalExpression", {
          test: convertValue(v[1]),
          consequent: convertNode(v[2], true),
          alternate: convertNode(v[3], true)
        });
    }
    else {
      return ast("IfStatement", {
          test: convertValue(v[1]),
          consequent: convertStmt(v[2]),
          alternate: convertStmt(v[3])
        });
    }
  },

  "or": function(v){
    var rest = v.slice(1);
    switch (rest.length){
      case 0: return ast("Literal", {value: false});
      case 1: return ast("LogicalExpression", {
                  operator: "||",
                  left: convertValue(rest[0]),
                  right: ast("Literal", {value: false})
                });
      default:
        return rest.slice(1).reduce(function(acc, item){
            return ast("LogicalExpression", {
                operator: "||",
                left: acc,
                right: convertValue(item)
              });
          }, convertValue(rest[0]));
    }
  },

  "not": function(v){
    raiseIf(v.length !== 2, "malformed not");
    return ast("UnaryExpression", {
      operator: "!",
      argument: convertValue(v[1])
    });
  },

  "throw": function(v, valueNeeded){
    raiseIf(v.length !== 2, "malformed throw");
    var throwStmt = ast("ThrowStatement", {argument: convertValue(v[1])});
    if (valueNeeded)
      return wrapWithFunctionCall(throwStmt);
    else
      return throwStmt;
  }
}


function convertValue(v){
  return convertNode(v, true);
}

// Returns JS-AST for Escodegen.
function convertNode(v, valueNeeded){
  if (_.isNumber(v) || _.isString(v) || _.isRegExp(v) ||
      _.isBoolean(v) || _.isNull(v)){
    return ast("Literal", {value: v});
  }
  else if(_.isUndefined(v)){
    return ast("UnaryExpression", {
      operator: "void", 
      argument: ast("Literal", {value: 0})
    });
  }
  else if(_.isEmpty(v)){
    return ast("ObjectExpression", {properties: []});
  }
  else if(isSymbol(v)) {
    return ast("Identifier", {name: v.jsName});
  }
  else if(_.isArray(v)){ // application
    var first = v[0], rest = v.slice(1);
    raiseIf(!(isSymbol(first)), "TODO")

    var conv = syntaxes[first.name];
    if (conv) {
      return conv(v, valueNeeded);
    }
    else {
      return ast("CallExpression", {
          callee: convertValue(v[0]),
          arguments: rest.map(convertValue)
        });
    }
  }
  else { // object
    return ast("ObjectExpression", {
      properties: _.pairs(v).map(function(pair){
        return ast("Property", {
          kind: "init",
          key: ast("Identifier", {name: pair[0]}),
          value: convertValue(pair[1])
        });
      })
    });
  }
}

exprs.forEach(function(expr){
  var ast = convertNode(expr);
  //util.puts(util.inspect(ast, false, null, true));
  util.puts(escodegen.generate(ast));
});
