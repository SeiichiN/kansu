// 関数型言語をつくる
"use strict";

var expect = require('expect.js');

var list = require('./billies.list.js');

var ID = {
    // unit:: T => ID[T]
    unit: (value) => {
        return value;
    },
    // flatMap:: ID[T] => FUN[T => ID[T]] => ID[T]
    flatMap: (instanceM) => {
        return (transform) => {
            return transform(instanceM);
        };
    }
};
var pair = {
    // pairの代数的データ構造
    cons: (left, right) => {
        return (pattern) => {
            return pattern.cons(left, right);
        };
    },
    match: (data, pattern) => {
        return data(pattern);
    },
    // ペアの右側を取得する
    right: (tuple) => {
        return pair.match(tuple, {
            cons: (left, right) => {
                return right;
            }
        });
    },
    // ペアの左側を取得する
    left: (tuple) => {
        return pair.match(tuple, {
            cons: (left, right) => {
                return left;
            }
        });
    }
};


describe('抽象構文木をつくる', () => {
	var exp = {
		// 式のパターンマッチ関数
		match: (data, pattern) => {
			return data(pattern);
		},
		// 数値の式
		num: (value) => {
			return (pattern) => {
				return pattern.num(value);
			};
		},
		// 変数の式
		variable: (name) => {
			return (pattern) => {
				return pattern.variable(name);
			};
		},
		// 関数定義の式（ラムダ式）
		lambda: (variable, body) => {
			return (pattern) => {
				return pattern.lambda(variable, body);
			};
		},
		// 関数適用の式
		app: (lambda, arg) => {
			return (pattern) => {
				return pattern.app(lambda, arg);
			};
		},
		// 足し算の式
		add: (expL, expR) => {
			return (pattern) => {
				return pattern.add(expL, expR);
			};
		},
        // ログ出力評価器の式
        log: (anExp) => {
            return (pattern) => {
                return pattern.log(anExp);
            };
        }
	};

    var env = {
        // 空の環境をつくる処理
        // empty:: STRING => VALUE
        empty: (variable) => {
            return undefined;
            
        },
        // 環境を拡張する処理
        // extend:: (STRING, VALUE, ENV) => ENV
        extend: (identifier, value, environment) => {
            return (queryIdentifier) => {
                if (identifier === queryIdentifier) {
                    return value;
                } else {
                    return env.lookup(queryIdentifier, environment);
                }
            };
        },
        // 変数名に対応する値を環境から取り出す処理
        // lookup:: (STRING, ENV) => VALUE
        lookup: (name, environment) => {
            return environment(name);
        }
    };

    it('変数バインディングにおける環境のセマンティクス', (next) => {
        expect(
            ((_) => {
                // 空の環境からnewEnv環境をつくる
                var newEnv = env.extend("a", 1, env.empty);
                // newEnv環境を利用して a の値を求める
                return env.lookup("a", newEnv);
            })()
        ).to.eql(
            1
        );
        next();
    });

    it('クロージャーにおける「環境」のはたらき', (next) => {
        var x = 1;
        // クロージャーをつくる
        var closure = () => {
            var y = 2;
            return x + y;  // くろーじゃの外側にある変数を参照する
        };
        expect (
            closure()
        ).to.eql(
            3
        );
        
        next();
    });
    
    it ('クロージャーにおける環境のセマンティクス', (next) => {
        expect(
            ((_) => {
                // 空の辞書を作成する
                var initEnv = env.empty;
                // 空の辞書から、outerEnv環境をつくる
                var outerEnv = env.extend("x", 1, initEnv);

                // closureEnv環境をつくる
                var closureEnv = env.extend("y", 2, outerEnv);
                // closureEnv環境を利用して、x+y を計算する
                return env.lookup("x", closureEnv) + env.lookup("y", closureEnv);
            })()
        ).to.eql(
            3
        );

        next();
    });

    describe('恒等モナドによる評価器', () => {
        // evaluate:: (EXP, ENV) => ID[VALUE]
        var evaluate = (anExp, environment) => {
            return exp.match(anExp, {
                // 数値の評価
                num: (numericValue) => {
                    return ID.unit(numericValue);
                },
                // 変数の評価
                variable: (name) => {
                    return ID.unit(env.lookup(name, environment));
                },
                // 関数定義（ラムダ式）の評価
                lambda: (variable, body) => {
                    return exp.match(variable, {
                        variable: (name) => {
                            return ID.unit((actualArg) => {
                                return evaluate(body,
                                                env.extend(name, actualArg, environment));
                            });
                        }
                    });
                },
                // 関数適用の評価
                app: (lambda, arg) => {
                    return ID.flatMap(evaluate(lambda, environment))((closure) => {
                        return ID.flatMap(evaluate(arg, environment))((actualArg) => {
                            return closure(actualArg);
                        });
                    });
                },
                // 足し算の評価
                add: (expL, expR) => {
                    return ID.flatMap(evaluate(expL, environment))((valueL) => {
                        return ID.flatMap(evaluate(expR, environment))((valueR) => {
                            return ID.unit(valueL + valueR);
                        });
                    });
                }
            });
        };

        it('数値の評価のテスト', (next) => {
            expect(
                evaluate(exp.num(2), env.empty)
            ).to.eql(
                ID.unit(2)
            );
            next();
        });

        it('変数の評価のテスト', (next) => {
            // 変数xを1に対応させた環境をつくる
            var newEnv = env.extend("x", 1, env.empty);
            // 拡張したnewEnv環境を用いて変数xを評価する
            expect(
                evaluate(exp.variable("x"), newEnv)
            ).to.eql(
                ID.unit(1)
            );
            next();
        });

        it('足し算の評価のテスト', (next) => {
            var addition = exp.add(exp.num(1), exp.num(2));
            expect(
                evaluate(addition, env.empty)
            ).to.eql(
                ID.unit(3)
            );
            next();
        });

        it ('関数適用の評価のテスト', (next) => {
            var expression = exp.app(
                exp.lambda(exp.variable("n"),
                           exp.add(exp.variable("n"),
                                   exp.num(1))),
                exp.num(2));
            expect(
                evaluate(expression, env.empty)
            ).to.eql(
                ID.unit(3)
            );
            next();
        });

        it('カリー化関数の評価', (next) => {
            var expression = exp.app(
                exp.app(
                    exp.lambda(exp.variable("n"),
                               exp.lambda(exp.variable("m"),
                                          exp.add(
                                              exp.variable("n"), exp.variable("m")))),
                    exp.num(2)),
                exp.num(3));
            expect(
                evaluate(expression, env.empty)
            ).to.eql(
                ID.unit(5)
            );
            next();
        });
    });

    describe('LOGモナド評価器', () => {
        
        // LOGモナドの定義
        // LOG[T] = PAIR[T, LIST[STRING]]
        var LOG = {
            // unit:: VALUE => LOG[VALUE]
            unit: (value) => {
                // 値とLOGのPair型をつくる
                return pair.cons(value, list.empty());
            },
            // flatMap:: LOG[T] => FUN[T => LOG[T]] => LOG[T]
            flatMap: (instanceM) => {
                return (transform) => {
                    return pair.match(instanceM, {
                        // pair型に格納されている値の対をとりだす
                        cons: (value, log) => {
                            // 取り出した値で計算する
                            var newInstance = transform(value);
                            // 計算の結果をPairの左側に格納し、
                            // 新しいログをPairの右側に格納する
                            return pair.cons(pair.left(newInstance),
                                             list.append(log)(pair.right(newInstance)));
                        }
                    });
                };
            },
            // 引数 value をログに格納する
            // output:: VALUE => LOG[()]
            output: (value) => {
                return pair.cons(null,
                                 list.cons(String(value), list.empty()));
            }
        };

        // LOGモナド評価器
        // evaluate:: (EXP, ENV) => LOG[VALUE]
        var evaluate = (anExp, environment) => {
            return exp.match(anExp, {
                // log式の評価
                log: (anExp) => {
                    // 式を評価する
                    return LOG.flatMap(evaluate(anExp, environment))((value) => {
                        // value をログに格納する
                        return LOG.flatMap(LOG.output(value))((_) => {
                            return LOG.unit(value);
                        });
                    });
                },

                // 数値の評価
                num: (numericValue) => {
                    return LOG.unit(numericValue);
                },
                // 変数の評価
                variable: (name) => {
                    return LOG.unit(env.lookup(name, environment));
                },
                // 関数定義（ラムダ式）の評価
                lambda: (variable, body) => {
                    return exp.match(variable, {
                        variable: (name) => {
                            return LOG.unit((actualArg) => {
                                return evaluate(body,
                                                env.extend(name, actualArg, environment));
                            });
                        }
                    });
                },
                // 関数適用の評価
                app: (lambda, arg) => {
                    return LOG.flatMap(evaluate(lambda, environment))((closure) => {
                        return LOG.flatMap(evaluate(arg, environment))((actualArg) => {
                            return closure(actualArg);
                        });
                    });
                },
                // 足し算の評価
                add: (expL, expR) => {
                    return LOG.flatMap(evaluate(expL, environment))((valueL) => {
                        return LOG.flatMap(evaluate(expR, environment))((valueR) => {
                            return LOG.unit(valueL + valueR);
                        });
                    });
                }
            });
        };

        it('ログ出力評価器による評価戦略の確認', (next) => {
            // ログ出力の対象とする式
            // ((n) => { return 1 + n })(2) の評価
            var theExp =exp.log( exp.app(exp.lambda(exp.variable("n"),
                                            exp.add(exp.log(exp.num(1)), exp.variable("n"))),
                                 exp.log(exp.num(2))));
            pair.match(evaluate(theExp, env.empty), {
                // パターンマッチで結果を取り出す
                cons: (value, log) => {
                    expect(
                        value
                    ).to.eql(
                        3
                    );
                    expect(
                        list.toArray(log)
                    ).to.eql(
                        [2, 1, 3]
                    );
                }
            });
            next();
        });
    });
});
