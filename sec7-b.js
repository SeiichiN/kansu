"use strict";

var expect = require('expect.js');
var list = require('./billies.list.js');
var stream = require('./billies.stream.js');

// console.log(list);

describe('非同期処理にコールバック関数を渡す', () => {
    it('tarai関数の定義', (next) => {
        var tarai = (x, y, z) => {
            if (x > y) {
                return tarai(tarai(x - 1, y, z),
                             tarai(y - 1, z, x),
                             tarai(z - 1, x, y));
            } else {
                return y;
            }
        };
        expect(
            tarai(1 * 2, 1, 0)
        ).to.eql(
            2
        );
        next();
    });
});

describe('継続で未来を渡す', () => {
    describe('継続とは何か', () => {
        var succ = (n, continues) => {
            return continues(n + 1);
        };

        var identity = (any) => {
            return any;
        };

        it('継続渡しのsucc関数', (next) => {

            // identity関数を継続として渡すことで
            // succ(1)の結果がそのまま返る
            expect(
                succ(1, identity)
            ).to.eql(
                2
            );
            next();
        });
        it('add(2, succ(3))の継続渡し', (next) => {
            // 継続渡しのadd関数
            var add = (n, m, continues) => {
                return continues(n + m);
            };
            // 継続渡しのsucc関数とadd関数を使って
            // add(2, succ(3))を計算する
            expect(
                succ(3,
                     (succResult) => {
                         return add(2, succResult, identity)
                     })
            ).to.eql(
                6
            );
            next();
        });
        it('継続による反復処理からの脱出', (next) => {
            var find = (
                aStream,
                predicate,
                continuesOnFailure,
                continuesOnSuccess) => {
                    return stream.match(aStream, {
                        /*
                           リストの最末尾に到着した場合、
                           成功継続で反復処理を抜ける
                         */
                        empty: () => {
                            return continuesOnSuccess(null);
                        },
                        cons: (head, tailThunk) => {
                            /*
                               目的の要素を見つけた場合
                               成功継続で反復処理を抜ける
                             */
                            if (predicate(head) === true) {
                                return continuesOnSuccess(head);
                            } else {
                                /*
                                   目的の要素を見つけられなかった場合
                                   失敗継続で次の反復処理を続ける
                                 */
                                return continuesOnFailure(tailThunk(),
                                                          predicate,
                                                          continuesOnFailure,
                                                          continuesOnSuccess);
                            }
                        }
                    });
                };
            // 成功継続では、値を返すだけで反復処理を脱出する。
            var continuesOnSuccess = identity;

            var continuesOnFailure = (
                aStream,
                predicate,
                continuesOnRecursion,
                escapeFromRecursion
            ) => {
                // find関数を再帰的に呼び出す
                return find(
                    aStream,
                    predicate,
                    continuesOnRecursion,
                    escapeFromRecursion
                );
            };

            
            // find関数のテスト
            // 変数integersは、無限の整数ストリーム
            var integers = stream.enumFrom(0);

            // 試しに最初の10個を配列で取り出してみる
            var take10 = stream.toArray(stream.take(integers)(10));

            expect(
                take10
            ).to.eql(
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            );

            // 無限の整数列のなかから100を探す

            expect(
                find(
                    integers,
                    (item) => { return (item === 100); },
                    continuesOnFailure,
                    continuesOnSuccess
                )
            ).to.eql(
                100
            );

            next();
        });
        it('決定性計算機', (next) => {
            // 式の代数的データ構造
            var exp = {
                match: (anExp, pattern) => {
                    return anExp(pattern);
                },
                num: (n) => {
                    return (pattern) => {
                        return pattern.num(n);
                    };
                },
                add: (exp1, exp2) => {
                    return (pattern) => {
                        return pattern.add(exp1, exp2);
                    };
                },
            };
            // 式の評価関数
            /*
               calculate(exp.num(2)) という式を考えた場合、
               exp.match(exp.num(2), pattern式) という関数が返ってくる。
               上式のexp.match より、exp.match(exp.num(2), pattern式)は、
               exp.num(2)(pattern式)という関数が返される。
               これは、上式より、pattern式.num(2)となるので、結局、
               return 2 となる。
            */
            var calculate = (anExp) => {
                return exp.match(anExp, {
                    num: (n) => {
                        return n;
                    },
                    add: (exp1, exp2) => {
                        return calculate(exp1) + calculate(exp2);
                    }
                });
            };

            expect(
                calculate(exp.num(3))
            ).to.eql(
                3
            );
            expect(
                calculate(exp.add(exp.num(2), exp.num(3)))
            ).to.eql(
                5
            );
            next();
        });
        it('非決定性計算機', (next) => {
            // 式の代数的データ構造
            var exp = {
                match: (anExp, pattern) => {
                    return anExp(pattern);
                },
                num: (n) => {
                    return (pattern) => {
                        return pattern.num(n);
                    };
                },
                add: (exp1, exp2) => {
                    return (pattern) => {
                        return pattern.add(exp1, exp2);
                    };
                },
                amb: (alist) => {
                    return (pattern) => {
                        return pattern.amb(alist);
                    };
                }
            };
            // 式の評価関数
            var calculate = (
                anExp,
                continuesOnSuccess,
                continuesOnFailure) => {
                    return exp.match(anExp, {
                        num: (n) => {
                            // num(n)のあとの計算の失敗に備えて
                            // 元の失敗継続を渡す
                            return continuesOnSuccess(n, continuesOnFailure);
                        },
                        add: (x, y) => {
                            // 引数xを評価する
                            return calculate(x, (resultX, continuesOnFailureX) => {
                                // 引数yを評価する
                                return calculate(y, (resultY, continuesOnFailureY) => {
                                    // 引数xとyがともに成功すれば、両者の間で足し算を計算する
                                    return continuesOnSuccess(resultX + resultY, continuesOnFailureY);
                                }, continuesOnFailureX);  // yの計算に失敗すれば、xの失敗継続を渡す
                            }, continuesOnFailure);  // xの計算に失敗すれば、おおもとの失敗継続を渡す
                        }, 
                        amb: (choices) => {
                            var calculateAmb = (choices) => {
                                return list.match(choices, {
                                    /*
                                       amb(list.empty())の場合、
                                       すなわち選択肢がなければ、失敗継続を実行する
                                     */
                                    empty: () => {
                                        return continuesOnFailure();
                                    },
                                    /*
                                       amb(list.cons(head, tail))の場合、
                                       先頭要素を計算して、後尾は失敗継続に渡す
                                     */
                                    cons: (head, tail) => {
                                        return calculate(head, continuesOnSuccess, (_) => {
                                            // 失敗継続で後尾を計算する
                                            return calculateAmb(tail);
                                        });
                                    }
                                });
                            };
                            return calculateAmb(choices);
                        }
                    });
                };

            var driver = (expression) => {
                // 中断された計算を継続として保存する変数
                var suspendedComputation = null;
                // 成功継続
                var continuesOnSuccess = (anyValue,
                                          continuesOnFailure) => {
                                              // 再開に備えて、失敗継続を保存しておく
                                              suspendedComputation = continuesOnFailure;
                                              return anyValue;
                                          };
                // 失敗継続
                var continuesOnFailure = () => {
                    return null;
                };

                // 内部に可変な変数suspendedComputationを持つクロージャーを渡す
                return () => {
                    // 中断された継続がなければ、最初から計算する
                    if (suspendedComputation === null) {
                        return calculate(expression,
                                         continuesOnSuccess,
                                         continuesOnFailure);
                    } else {
                        return suspendedComputation();
                    }
                };
            };

            // TEST
            var ambExp = exp.add(exp.amb(list.cons(exp.num(1), list.cons(exp.num(2), list.empty()))),
                                 exp.num(3));
            var calculator = driver(ambExp);

            expect(
                calculator()
            ).to.eql(
                4
            );
            expect(
                calculator()
            ).to.eql(
                5
            );
            expect(
                calculator()
            ).to.eql(
                null
            );


            // amb[1, 2] + amb[3, 4] = 4, 5, 5, 6
            var ambExp = exp.add(
                exp.amb(list.fromArray([exp.num(1), exp.num(2)])),
                exp.amb(list.fromArray([exp.num(3), exp.num(4)]))
            );
            var calculator = driver(ambExp);

            expect(
                calculator()
            ).to.eql(
                6
            );

            var ambExp = exp.add(
                exp.amb(list.cons(exp.num(1), list.cons(exp.num(2), list.empty()))),
                exp.amb(list.cons(exp.num(3), list.cons(exp.num(4), list.empty())))
            );
            var calculator = driver(ambExp);
            expect(
                calculator()
            ).to.eql(
                4
            );
            expect(
                calculator()
            ).to.eql(
                5
            );
            expect(
                calculator()
            ).to.eql(
                5
            );
            expect(
                calculator()
            ).to.eql(
                6
            );
            expect(
                calculator()
            ).to.eql(
                null
            );
            
                        
            
            next();
        });
    });
});
