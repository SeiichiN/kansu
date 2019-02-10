"use strict";

var expect = require('expect.js');
// var list = require('./billies.list.js');
// var stream = require('./billies.stream.js');

var succ = (n) => {
	return n + 1;
};

var double = (n) => {
    return n * 2;
};

// 関数合成の定義
var compose = (f, g) => {
	return (arg) => {
		return f(g(arg));
	};
};

describe('恒等モナド', () => {
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

    it('恒等モナドのunit関数のテスト', (next) => {
        expect(
            ID.unit(1)
        ).to.eql(
            1
        );
        
        next();
    });

    it('恒等モナドのflatMap関数のテスト', (next) => {
        expect(
            ID.flatMap(ID.unit(1))((one) => {
                return ID.unit(succ(one));
            })
        ).to.eql(
            succ(1)
        );
        next();
    });

    it('flatMapと関数合成の類似性', (next) => {
        expect(
            ID.flatMap(ID.unit(1))((one) => {
                // succ関数を適用する
                return ID.flatMap(ID.unit(succ(one)))((two) => {
                    // double関数を適用する
                    return ID.unit(double(two));
                });
            })
        ).to.eql(
            compose(double, succ)(1)
        );
        next();
    });

    it('恒等モナドのモナド則', (next) => {
        // 以下の設定で恒等モナドのモナド則をテストする
        var instanceM = ID.unit(1);

        var f = (n) => {
            return ID.unit(n + 1);
        };

        var g = (n) => {
            return ID.unit(- n);
        };

        // 右単位元則
        expect(
            ID.flatMap(instanceM)(ID.unit)
        ).to.eql(
            instanceM
        );
        // 左単位元則
        expect(
            ID.flatMap(ID.unit(1))(f)
        ).to.eql(
            f(1)
        );
        // 結合法則
        expect(
            ID.flatMap(ID.flatMap(instanceM)(f))(g)
        ).to.eql(
            ID.flatMap(instanceM)((x) => {
                return ID.flatMap(f(x))(g);
            })
        );
        next();
    });
});

describe('maybeモナドでエラーを処理する', () => {
    var maybe = {
        match: (exp, pattern) => {
            return exp(pattern);
        },
        just: (value) => {
            return (pattern) => {
                return pattern.just(value);
            };
        },
        nothing: (_) => {
            return (pattern) => {
                return pattern.nothing(_);
            };
        }
    };

    var MAYBE = {
        // unit:: T => MAYBE[T]
        unit: (value) => {
            return maybe.just(value);
        },
        // flatMap:: MAYBE[T] => FUN[T => MAYBE[U]] => MAYBE[U]
        flatMap: (instanceM) =>{
            return (transform) => {
                return maybe.match(instanceM, {
                    // 正常な場合は、transform関数を計算する
                    just: (value) => {
                        return transform(value);
                    },
                    // エラーの場合は何もしない
                    nothing: (_) => {
                        return maybe.nothing();
                    }
                });
            };
        },
        // ヘルパー関数
        getOrElse: (instanceM) => {
            return (alternate) => {
                return maybe.match(instanceM, {
                    just: (value) => {
                        return value;
                    },
                    nothing: (_) => {
                        return alternate;
                    }
                });
            };
        }
    };

    it('Maybeモナドの利用法', (next) => {
        // 足し算を定義する
        var add = (maybeA, maybeB) => {
            return MAYBE.flatMap(maybeA)((a) => {
                return MAYBE.flatMap(maybeB)((b) => {
                    return MAYBE.unit(a + b);
                });
            });
        };
        var justOne = maybe.just(1);
        var justTwo = maybe.just(2);

        expect(
            MAYBE.getOrElse(add(justOne, justOne))(null)
        ).to.eql(
            2
        );

        expect(
            MAYBE.getOrElse(add(justOne, maybe.nothing()))(null)
        ).to.eql(
            null
        );
        next();
    });
});

describe('IOモナドで副作用を閉じ込める', () => {
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
            return this.match(tuple, {
                cons: (left, right) => {
                    return right;
                }
            });
        },
        // ペアの左側を取得する
        left: (tuple) => {
            return this.match(tuple, {
                cons: (left, right) => {
                    return right;
                }
            });
        }
    };
    describe('外界を明示したIOモナドの定義', () => {
        var IO = {
            // unit:: T => IO[T]
            unit: (any) => {
                return (world) => {    // world -- 現在の外界
                    return pair.cons(any, world);
                };
            },
            // flatMap:: IO[A] => (A => IO[B]) => IO[B]
            flatMap: (instanceA) => {
                return (actinAB) => {   // actionAB:: A -> IO[B]
                    return (world) => {
                        // 現在の外界の中でinstanceAのIOアクションを実行する
                        var newPair = instanceA(world);
                        return pair.match(newPair, {
                            cons: (value, newWorld) => {
                                /*
                                   新しい外界の中で、actionAB(value)で作られた
                                   IOアクションを実行する
                                 */
                                return actionAB(value)(newWorld);
                            }
                        });
                        
                    };
                };
            }
        };
    });
});
