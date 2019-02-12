// 関数型言語をつくる
"use strict";

var expect = require('expect.js');

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
});
