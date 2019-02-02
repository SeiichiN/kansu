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

        it('継続私のsucc関数', (next) => {

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
                succ(3, (succResult) => {
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
                    return list.match(aStream, {
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
                                return continuesOnFailure(tailThunk,
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
    });
});
