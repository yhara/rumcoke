// Generated by RumCoke v0.0.2.dev
var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var escodegen = require('escodegen');
var Parser = require('./parser');
var parser = Parser.parser;
var Sym = Parser.Sym;
var isSymbol = Parser.isSymbol;
var d = function (x) {
    return util.puts('debug: ', util.inspect(x, false, null, true));
};
var raise = function (msg, info) {
    info || (info = {});
    info['ERROR'] = msg;
    return function () {
        throw util.inspect(info);
    }();
};
var raiseIf = function (cond, msg, info) {
    return cond ? raise(msg, info) : void 0;
};
var ast = function (typename, info) {
    info['type'] = typename;
    return info;
};
var convertDefvar = function (left, rest) {
    var init = rest.length === 0 ? null : rest.length === 1 ? convertValue(rest[0]) : raise('malformed defvar', {'receiver': receiver});
    return ast('VariableDeclaration', {
        'kind': 'var',
        'declarations': [ast('VariableDeclarator', {
                'id': convertNode(left),
                'init': init
            })]
    });
};
var wrapWithFunctionCall = function (innerAst) {
    return ast('CallExpression', {
        'arguments': [],
        'callee': ast('FunctionExpression', {
            'params': [],
            'defaults': [],
            'body': ast('BlockStatement', {'body': [statementExpr(innerAst)]})
        })
    });
};
var statementExpr = function (innerAst) {
    return innerAst.type.match(/Literal|Expression$/) ? ast('ExpressionStatement', {'expression': innerAst}) : innerAst;
};
var convertStmt = function (v) {
    return statementExpr(convertNode(v));
};
var blockStmtWithReturn = function (bodyExprs) {
    return ast('BlockStatement', {'body': bodyExprs.map(function (bodyItem, idx) {
            return idx === bodyExprs.length - 1 ? ast('ReturnStatement', {'argument': convertValue(bodyItem)}) : convertStmt(bodyItem);
        })});
};
var functionWithReturn = function (paramsAry, defaults, bodyExprs) {
    return ast('FunctionExpression', {
        'params': _.map(paramsAry, function (param) {
            raiseIf(!isSymbol(param), 'malformed defun param');
            return convertNode(param);
        }),
        'defaults': defaults,
        'body': blockStmtWithReturn(bodyExprs)
    });
};
var convertDefun = function (left, rest) {
    var fname = left[0];
    var params = left.slice(1);
    raiseIf(!isSymbol(fname), 'malformed defun');
    return ast('VariableDeclaration', {
        'kind': 'var',
        'declarations': [ast('VariableDeclarator', {
                'id': convertNode(fname),
                'init': functionWithReturn(params, [], rest)
            })]
    });
};
var syntaxes = {
        'define': function (v) {
            var left = v[1];
            var rest = v.slice(2);
            return isSymbol(left) ? convertDefvar(left, rest) : _.isArray(left) ? convertDefun(left, rest) : raise('malformed define', {
                'left': left,
                'rest': rest
            });
        },
        '^': function (v) {
            raiseIf(!_.isArray(v[1]), 'malformed function literal params');
            return functionWithReturn(v[1], [], v.slice(2));
        },
        '..': function (v) {
            var receiver = v[1];
            var callSpecs = v.slice(2);
            return callSpecs.reduce(function (acc, callSpec) {
                return isSymbol(callSpec) ? ast('MemberExpression', {
                    'computed': false,
                    'object': acc,
                    'property': convertNode(callSpec)
                }) : _.isArray(callSpec) ? function () {
                    raiseIf(!isSymbol(callSpec[0]), 'malformed ..', {
                        'expected': 'Symbol',
                        'given': callSpec[0]
                    });
                    return ast('CallExpression', {
                        'callee': ast('MemberExpression', {
                            'computed': false,
                            'object': acc,
                            'property': convertNode(callSpec[0])
                        }),
                        'arguments': _.map(callSpec.slice(1), convertValue)
                    });
                }() : raise('malformed ..');
            }, convertValue(receiver));
        },
        'set!': function (v) {
            return ast('AssignmentExpression', {
                'operator': '=',
                'left': convertValue(v[1]),
                'right': convertValue(v[2])
            });
        },
        'aset!': function (v) {
            return ast('AssignmentExpression', {
                'operator': '=',
                'left': ast('MemberExpression', {
                    'computed': true,
                    'object': convertValue(v[1]),
                    'property': convertValue(v[2])
                }),
                'right': convertValue(v[3])
            });
        },
        '~': function (v) {
            raiseIf(!(v.length === 3), 'mailformed ~');
            return ast('MemberExpression', {
                'computed': true,
                'object': convertValue(v[1]),
                'property': convertValue(v[2])
            });
        },
        'array': function (v) {
            return ast('ArrayExpression', {'elements': _.map(v.slice(1), convertValue)});
        },
        '=': function (v) {
            raiseIf(!(v.length === 3), 'malformed =');
            return ast('BinaryExpression', {
                'operator': '===',
                'left': convertValue(v[1]),
                'right': convertValue(v[2])
            });
        },
        'if': function (v, isValueNeeded) {
            return isValueNeeded ? ast('ConditionalExpression', {
                'test': convertValue(v[1]),
                'consequent': convertValue(v[2]),
                'alternate': convertValue(v[3])
            }) : _.isUndefined(v[3]) ? ast('IfStatement', {
                'test': convertValue(v[1]),
                'consequent': convertStmt(v[2])
            }) : ast('IfStatement', {
                'test': convertValue(v[1]),
                'consequent': convertStmt(v[2]),
                'alternate': convertStmt(v[3])
            });
        },
        'begin': function (v, isValueNeeded) {
            return isValueNeeded ? ast('CallExpression', {
                'arguments': [],
                'callee': ast('FunctionExpression', {
                    'params': [],
                    'defaults': [],
                    'body': blockStmtWithReturn(v.slice(1))
                })
            }) : ast('BlockStatement', {'body': _.map(v.slice(1), convertStmt)});
        },
        'and': function (v) {
            return ast('LogicalExpression', {
                'operator': '&&',
                'left': convertValue(v[1]),
                'right': convertValue(v[2])
            });
        },
        'or': function (v) {
            var rest = v.slice(1);
            return rest.length === 0 ? ast('Literal', {'value': false}) : rest.length === 1 ? ast('LogicalExpression', {
                'operator': '||',
                'left': convertValue(rest[0]),
                'right': ast('Literal', {'value': false})
            }) : _.reduce(rest.slice(1), function (acc, item) {
                return ast('LogicalExpression', {
                    'operator': '||',
                    'left': acc,
                    'right': convertValue(item)
                });
            }, convertValue(rest[0]));
        },
        'not': function (v) {
            raiseIf(!(v.length === 2), 'malformed not');
            return ast('UnaryExpression', {
                'operator': '!',
                'argument': convertValue(v[1])
            });
        },
        'while': function (v, isValueNeeded) {
            var whileStmt = ast('WhileStatement', {
                    'test': convertValue(v[1]),
                    'body': ast('BlockStatement', {'body': _.map(v.slice(2), convertStmt)})
                });
            return isValueNeeded ? wrapWithFunctionCall(whileStmt) : whileStmt;
        },
        'break': function (v) {
            return ast('BreakStatement', {'label': null});
        },
        'throw': function (v, isValueNeeded) {
            raiseIf(!(v.length === 2), 'malformed throw');
            var throwStmt = ast('ThrowStatement', {'argument': convertValue(v[1])});
            return isValueNeeded ? wrapWithFunctionCall(throwStmt) : throwStmt;
        },
        'js-ast': function (v) {
            raiseIf(!(v.length === 3), 'malformed js-ast');
            return ast(v[1], v[2]);
        }
    };
_.each([
    '+',
    '-',
    '*',
    '/'
], function (op) {
    return syntaxes[op] = function (v) {
        return ast('BinaryExpression', {
            'operator': op,
            'left': convertValue(v[1]),
            'right': convertValue(v[2])
        });
    };
})
var convertValue = function (v) {
    return convertNode(v, true);
};
var convertNode = function (v, isValueNeeded) {
    return _.isNumber(v) || _.isString(v) || _.isRegExp(v) || _.isBoolean(v) || _.isNull(v) ? ast('Literal', {'value': v}) : _.isUndefined(v) ? ast('UnaryExpression', {
        'operator': 'void',
        'argument': ast('Literal', {'value': 0})
    }) : _.isEmpty(v) ? ast('ObjectExpression', {'properties': []}) : isSymbol(v) ? ast('Identifier', {'name': v.jsName}) : _.isArray(v) ? function () {
        var first = v[0];
        var rest = v.slice(1);
        var conv = isSymbol(first) ? syntaxes[first.name] : false;
        return conv ? conv(v, isValueNeeded) : ast('CallExpression', {
            'callee': convertValue(v[0]),
            'arguments': rest.map(convertValue)
        });
    }() : ast('ObjectExpression', {'properties': _.map(_.pairs(v), function (pair) {
            return ast('Property', {
                'kind': 'init',
                'key': ast('Literal', {'value': pair[0]}),
                'value': convertValue(pair[1])
            });
        })});
};
var quote = function (v) {
    return isSymbol(v) ? [
        Sym('Sym'),
        v.name
    ] : _.isArray(v) ? [Sym('array')].concat(_.map(v, quote)) : v;
};
var macros = {
        'quote': function (v) {
            raiseIf(!(v.length === 2), 'malformed quote');
            return quote(v[1]);
        },
        'instance?': function (v) {
            raiseIf(!(v.length === 3), 'malformed instance?');
            return [
                Sym('js-ast'),
                'BinaryExpression',
                {
                    'operator': 'instanceof',
                    'left': translateExpr(v[1]),
                    'right': translateExpr(v[2])
                }
            ];
        },
        'when': function (v) {
            return [
                Sym('if'),
                v[1],
                [Sym('begin')].concat(v.slice(2)),
                void 0
            ];
        }
    };
var expandMacros = function (v, mod) {
    mod || (mod = {});
    return _.isArray(v) ? function () {
        var s = v[0];
        return isSymbol(s) ? syntaxes[s.name] ? v : function () {
            var macro = macros[s.name];
            return macro ? function () {
                mod['modified'] = true;
                var ret = macro(v);
                var _mod = {};
                while (true) {
                    ret = expandMacros(ret, _mod);
                    if (!_mod.modified)
                        break;
                    else
                        false;
                }
                return ret;
            }() : v.map(function (x) {
                return expandMacros(x, mod);
            });
        }() : v.map(function (x) {
            return expandMacros(x, mod);
        });
    }() : v;
};
var debug = false;
var translateExpr = function (expr) {
    if (debug)
        d(expr);
    else
        false;
    var expanded = expandMacros(expr);
    if (debug)
        d(expanded);
    else
        false;
    return convertNode(expanded);
};
var translate = function (exprs) {
    util.puts('// Generated by RumCoke v0.0.2.dev');
    return exprs.forEach(function (expr) {
        var ast = translateExpr(expr);
        if (debug)
            util.puts('ast: ' + util.inspect(ast, false, null, true));
        else
            false;
        return util.puts(escodegen.generate(ast));
    });
};
module.exports['translate'] = translate
module.exports['translateExpr'] = translateExpr
