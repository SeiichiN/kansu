"use strict";

var expect = require('expect.js');
var list = require('./billies.list.js');
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
                return (actionAB) => {   // actionAB:: A -> IO[B]
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
            },
            // done:: T => IO[T]   done関数
            done: (any) => {
                return IO.unit();
            },
            // run:: IO[A] => A
            run: (instanceM) => {
                return (world) => {
                    // IOアクションを現在の外界に適用し、結果のみを返す
                    return pair.left(instanceM(world));
                };
            },
            // readFile:: STRING => IO[STRING]
            // readFile関数は、pathで指定されたファイルを読み込むIOアクション
            readFile: (path) => {
                return (world) => {
                    var fs = require('fs');
                    var content = fs.readFileSync(path, 'utf8');
                    return IO.unit(content)(world);  // 外界を渡してIOアクションを返す
                };
            },
            // println:: STRING => IO[]
            // println関数は、messageで指定された文字列をコンソール画面に
            // 出力するIOアクション
            println: (message) => {
                return (world) => {
                    console.log(message);
                    return IO.unit(null)(world);
                };
            }
        };

        it ('run関数の利用法', (next) => {
            // 初期の外界に null をバインドする
            var initialWorld = null;
            expect(
                IO.run(IO.println("吾輩は猫である"))(initialWorld)
            ).to.eql(
                null
            );
            next();
        });
    });

    describe('外界を明示しないIOモナドの定義', () => {
        var IO = {
            // unit:: T => IO[T]
            unit: (any) => {
                return (_) => {  // 外界を指定しない
                    return any;  // 値だけを返す
                };
            },
            // flatMap:: IO[A] => FUN[A => IO[B]] => IO[B]
            flatMap: (instanceA) => {
                return (actionAB) => {  // actionAB:: A -> IO[B]
                    return (_) => {
                        // instanceAのIOアクションを実行し、
                        // 続いて actionABを実行する
                        return IO.run(actionAB(IO.run(instanceA)));

                    };
                    
                };
            },
            // done:: T => IO[T]
            done: (any) => {
                return IO.unit();
            },
            // run:: IO[A] => A
            run: (instance) => {
                if (instance !== null) {
                    return instance();
                } else {
                    return instance;
                }
            },
            // readFile:: STRING => IO[STRING]
            readFile: (path) => {
                return (_) => {
                    var fs = require('fs');
                    var content = fs.readFileSync(path, 'utf8');
                    return IO.unit(content)();
                };
            },
            // println:: STRING => IO[]
            println: (message) => {
                return (_) => {
                    console.log(message);
                    return IO.unit(null)();
                };
            },
            writeFile: (path) => {
                return (content) => {
                    return (_) => {
                        var fs = require('fs');
                        fs.writeFileSync(path, content);
                        return IO.unit(null)();
                    };
                };
            },
            // IO.putChar:: CHAR => IO[]
            // putChar関数は、1文字を出力する
            putChar: (character) => {
                // 1文字だけ画面に出力する
                process.stdout.write(character);
                return IO.unit(null)();
            },
            // seq関数は、2つのIOアクションを続けて実行する
            // これは本に書かれていたseq関数
            seq: (actionA) => {
                return (actionB) => {
                    return IO.unit(IO.run(IO.flatMap(actionA)((_) => {
                        return IO.flatMap(actionB)((_) => {
                            return IO.done();
                        });
                    })));
                };
            },
            
            /*
               // これは、著者のgithubにあったseq関数
               // http://akimichi.github.io/functionaljs/chap07.spec.html#io-monad
               // どちらでも動く
            seq: (instanceA) => {
                return (instanceB) => {
                    return IO.flatMap(instanceA)((a) => {
                        return instanceB;
                    });
                };
            },
            */
            
            // IO.putStr:: LIST[CHAR] => IO[]
            // putStr関数は、文字のリストを連続して出力する
            putStr: (alist) => {
                return list.match(alist, {
                    empty: () => {
                        return IO.done();
                    },
                    cons: (head, tail) => {
                        return IO.seq(IO.putChar(head))(IO.putStr(tail));
                    }
                });
            },
            // IO.putStrLn:: LIST[CHAR] => IO[]
            // putStrLn関数は、文字列を出力し、最後に改行を出力する
            putStrLn: (alist) => {
                return IO.seq(IO.putStr(alist))(IO.putChar("\n"));
            }
        };

        var string = {
            // 先頭文字を取得する
            head: (str) => {
                return str[0];
            },
            // 後尾文字列を取得する
            tail: (str) => {
                return str.substring(1);
            },
            // 空の文字列かどうかを判定する
            isEmpty: (str) => {
                return str.length === 0;
            },
            // 文字列を文字のリストに変換する
            toList: (str) => {
                if (string.isEmpty(str)) {
                    return list.empty();
                } else {
                    return list.cons(string.head(str),
                                     string.toList(string.tail(str)));
                }
            }
        };

        it('run関数の利用法', (next) => {
            expect(
                // 外界を指定する必要はありません
                IO.run(IO.println("名前はまだない"))
            ).to.eql(
                null
            );
            next();
        });

        it ('stringのテスト', (next) => {
            expect(
                string.head("abc")
            ).to.eql(
                'a'
            );
            expect(
                string.tail("abc")
            ).to.eql(
                'bc'
            );
            next();
        });


        it('ファイルの内容を画面に出力するプログラム', (next) => {
            // var path = process.argv[2];
            var path = "./resources/dream.txt";
            
            // ファイルをcontentに読み込む
            var cat = IO.flatMap(IO.readFile(path))((content) => {
                // 文字列を文字のリストに変換しておく
                var string_as_list = string.toList(content);
                // putStrLnでコンソール画面に出力する
                return IO.flatMap(IO.putStrLn(string_as_list))((_) => {
                    return IO.done(_);
                });
            });
            IO.run(cat);
            next();
        });


            
    });
        
});
