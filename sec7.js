"use strict";
// sec7.js
// 高階関数を活用する

var expect = require('expect.js');

var multipleOf = (n) => {
	return (m) => {
		if (m % n === 0) {
			return true;
		} else {
			return false;
		}
	};
};
var even = multipleOf(2);
// notコンビネータ
// not:: FUN[NUM => BOOL] => FUN[NUM => BOOL]
var not = (predicate) => {
	return (arg) => {
		return ! predicate(arg);
	};
};
/* var cons = (value, list) => {
 * 	return (pattern) => {
 * 		return pattern.cons(value, list);
 * 	};
 * };*/

var list = {
	empty: () => {
		return (pattern) => {
			return pattern.empty();
		};
	},
	cons:  (value, list) => {
		return (pattern) => {
			return pattern.cons(value, list);
		};
	},
	match:  (data, pattern) => {
		return data(pattern);
	},
	head:  (alist) => {
		return list.match(alist, {
			empty: (_) => {
				return null;
			},
			cons: (head, tail) => {
				return head;
			}
		});
	},
	tail: (alist) => {
		return list.match(alist, {
			empty: (_) => {
				return null;
			},
			cons: (head, tail) => {
				return tail;
			}
		});
	},
	isEmpty: (alist) => {
		return list.match(alist, {
			empty: (_) => {
				return true;
			},
			cons: (head, tail) => {
				return false;
			}
		});
	},
	append: (xs) => {
		return (ys) => {
			return list.match(xs, {
				empty: (_) => {
					return ys;
				},
				cons: (head, tail) => {
					return list.cons(head, list.append(tail, ys));
				}

			});
		};
	},
	map: (alist) => {
		return (transform) => {
			return match(alist, {
				empty: (_) => { return empty(); },
				cons: (head, tail) => {
					return cons(transform(head),
						map(tail, transform));
				}

			});
		};
	},
	reverse: (alist) => {
		var reverseHelper = (alist, accumulator) => {
			return list.match(alist, {
				empty: (_) => {
					return accumulator;
				},
				cons: (head, tail) => {
					return reverseHelper(tail, list.cons(head, accumulator));
				}
			});
		};
		return reverseHelper(alist, list.empty());
	},
	toArray: (alist) => {
		var toArrayHelper = (alist, accumulator) => {
			return list.match(alist, {
				empty: (_) => {
					return accumulator;
				},
				cons: (head, tail) => {
					return toArrayHelper(tail,
						accumulator.concat(head));
				}
			});
		};
		return toArrayHelper(alist, []);
	},
	sum: (alist) => {
		return (accumulator) => {
			return list.match(alist, {
				empty: (_) => {
					return accumulator;
				},
				cons: (head, tail) => {
					return list.sum(tail)(accumulator + head);
				}
			});
		};
	},
	sumWithCallback: (alist) => {
		return (accumulator) => {
			return (CALLBACK) => {
				return list.match(alist, {
					empty: (_) => {
						return accumulator;
					},
					cons: (head, tail) => {
						return CALLBACK(head)(
							list.sumWithCallback(tail)(accumulator)(CALLBACK)
						);
					}
				});
			};
		};
	},
	length: (alist) => {
		return (accumulator) => {
			return list.match(alist, {
				empty: (_) => {
					return accumulator;
				},
				cons: (head, tail) => {
					return list.length(tail)(accumulator + 1);
				}
			});
		};
	},
	lengthWithCallback: (alist) => {
		return (accumulator) => {
			return (CALLBACK) => {
				return list.match(alist, {
					empty: (_) => {
						return accumulator;
					},
					cons: (head, tail) => {
						return CALLBACK(head)(
							list.lengthWithCallback(tail)(accumulator)(CALLBACK)
						);
					}
				});
			};
		};
	},
	foldr: (alist) => {
		return (accumulator) => {
			return (callback) => {
				return list.match(alist, {
					empty: (_) => {
						return accumulator;
					},
					cons: (head, tail) => {
						return callback(head)(
							list.foldr(tail)(accumulator)(callback)
						);
					}
				});
			};
		};
	},
};
var stream = {
	match: (data, pattern) => {
		return data(pattern);
	},
	empty: (_) => {
		return (pattern) => {
			return pattern.empty();
		};
	},
	cons: (head, tailThunk) => {
		return (pattern) => {
			return pattern.cons(head, tailThunk);
		};
	},
	/* head:: STREAM[T] => T */
	head: (aStream) => {
		return stream.match(aStream, {
			empty: (_) => { return null; },
			cons: (value, tailThunk) => { return value; }
		});
	},
	/* tail:: STREAM[T] => STREAM[T] */
	tail: (aStream) => {
		return stream.match(aStream, {
			empty: (_) => { return null; },
			cons: (head, tailThunk) => {
				return tailThunk();
			}
		});
	},
	take: (aStream) => {
		return (n) => {
			return stream.match(aStream, {
				empty: (_) => {
					return list.empty();
				},
				cons: (head, tailThunk) => {
					if (n === 0) {
						return list.empty();
					} else {
						return  list.cons(head,
							stream.take(tailThunk()) (n - 1));
					}
				}
			});
		};
	},
	/* enumFrom(1) = 1, 2, 3, 4... */
	enumFrom: (n) => {
		return stream.cons(n, (_) => {
			return stream.enumFrom(n + 1);
		});
	},
	// ストリームの中から条件に合致した要素だけを抽出
	// filter:: FUN[T => BOOL] => STREAM[T] => STREAM[T]
	filter: (predicate) => {
		return (aStream) => {
			return stream.match(aStream, {
				empty: (_) => {
					return stream.empty();
				},
				cons: (head, tailThunk) => {
					if (predicate(head)) {
						return stream.cons(head, (_) => {
							return stream.filter(predicate)(tailThunk());
						});
					} else {
						return stream.filter(predicate)(tailThunk());
					}
				}
			});
		};
	},
	// ストリームの中から条件に合致した要素を削除
	// remove:: FUN[T => BOOL] => STREAM[T] => STREAM[T]
	remove: (predicate) => {
		return (aStream) => {
			return stream.filter(not(predicate))(aStream);
		};
	},
	toArray: (aStream) => {
		var toArrayHelper = (aStream, accumulator) => {
			return stream.match(aStream, {
				empty: (_) => {
					return accumulator;
				},
				cons: (head, tail) => {
					return toArrayHelper(tail,
						accumulator.concat(head));
				}
			});
		};
		return toArrayHelper(aStream, []);
	}
};

describe('カリー化で関数を返す', () => {
	it('multipleOf関数の定義', (next) => {
		var multipleOf = (n, m) => {
			if (m % n === 0) {
				return true;
			} else {
				return false;
			}
		};
		expect(
			multipleOf(2, 4)
		).to.eql(
			true
		);
		expect(
			multipleOf(2, 5)
		).to.eql(
			false
		);
		next();
	});
	it('カリー化されたmultipleOf関数の定義', (next) => {
		var multipleOf = (n) => {
			return (m) => {
				if (m % n === 0) {
					return true;
				} else {
					return false;
				}
			};
		};
		expect(
			multipleOf(2)(4)
		).to.eql(
			true
		);
		expect(
			multipleOf(2)(5)
		).to.eql(
			false
		);
		next();
	});
	it ('multipleOf関数のテスト', (next) => {
		var multipleOf = (n) => {
			return (m) => {
				if (m % n === 0) {
					return true;
				} else {
					return false;
				}
			};
		};
		var twoFold = multipleOf(2);
		expect(
			twoFold(4)
		).to.eql(
			true
		);
		next();
	});
	it ('指数関数の例', (next) => {
		var exponential = (base) => {
			return (index) => {
				if (index === 0) {
					return 1;
				} else {
					return base * exponential(base)(index - 1);
				}
			};
		};
		expect(
			exponential(2)(3)
		).to.eql(
			8
		);
		next();
	});
	it ('square関数', (next) => {
		var exponential = (base) => {
			return (index) => {
				if (index === 0) {
					return 1;
				} else {
					return base * exponential(base)(index - 1);
				}
			};
		};
		var square = exponential(2);
		// square = (index) => {
		//     if (index === 0) {
		//         return 1;
		//      } else {
		//          return 2 * square(index - 1);
		//      }
		//  };
		//  つまり、square関数は、2のn乗を計算する関数となる。
		expect(
			square(4)
		).to.eql(
			16
		);
		next();
	});
	it ('flip関数で、exponential関数の引数を逆転させる', (next) => {
		var exponential = (base) => {
			return (index) => {
				if (index === 0) {
					return 1;
				} else {
					return base * exponential(base)(index - 1);
				}
			};
		};
		var flip = (fun) => {
			return (x) => {
				return (y) => {
					return fun(y)(x);  // 引数の順番を変える
				};
			};
		};
		var square = flip(exponential)(2);
		var cube = flip(exponential)(3);
		// ------- TEST ----------
		expect(
			square(2)
		).to.eql(
			4
		);
		expect(
			square(3)
		).to.eql(
			9
		);
		expect(
			cube(2)
		).to.eql(
			8
		);
		next();
	});
	it('カリー化されたmultipleOf関数を使う', (next) => {
		var multipleOf = (n) => {
			return (m) => {
				if (m % n === 0) {
					return true;
				} else {
					return false;
				}
			};
		};
		var even = multipleOf(2);
		expect(
			even(2)
		).to.eql(
			true
		);
		next();
	});
	describe('コンビネータ', () => {
		var multipleOf = (n) => {
			return (m) => {
				if (m % n === 0) {
					return true;
				} else {
					return false;
				}
			};
		};
		var even = multipleOf(2);
		// notコンビネータ
		// not:: FUN[NUM => BOOL] => FUN[NUM => BOOL]
		var not = (predicate) => {
			return (arg) => {
				return ! predicate(arg);
			};
		};
		it ('!演算子はコンビネータではない', (next) => {
			var odd = not(even);
			expect(
				odd(3)
			).to.eql(
				true
			);
			expect(
				odd(2)
			).to.eql(
				false
			);
			next();
		});
	});
});

describe('関数を合成する', () => {
	// 関数合成の定義
	var compose = (f, g) => {
		return (arg) => {
			return f(g(arg));
		};
	};
	it ('関数合成のテスト', (next) => {
		var f = (x) => {
			return x * x + 1;
		};
		var g = (x) => {
			return x - 2;
		};
		expect(
			compose(f, g)(2)
		).to.eql(
			f(g(2))
		);
		next();
	});
	it('反数関数の合成', (next) => {
		// 反数の定義
		var opposite = (n) => {
			return - n;
		};
		expect (
			compose(opposite, opposite)(2)
		).to.eql(
			2
		);
		next();
	});
	it('カリー化による合成', (next) => {
		var opposite = (n) => {
			return - n;
		};
		var addCurried = (x) => {
			return (y) => {
				return x + y;
			};
		};
		expect(
			compose(opposite, addCurried(2))(3)
		).to.eql(
			-5
		);
		next();
	});
	it('具体的なlast関数', (next) => {
		var last = (alist) => {
			return list.match(alist, {
				empty: (_) => {
					return null;
				},
				cons: (head, tail) => {
					return list.match(tail, {
						empty: (_) => {
							return head;
						},
						cons: (_, __) => {
							return last(tail);
						}
					});
				}
			});
		};
		var alist = 
			list.cons(1,
				list.cons(2,
					list.cons(3,
						list.empty())));
		expect(
			last(alist)
		).to.eql(
			3
		);
		next();
	});
	it('抽象的なlast関数', (next) => {
		var last = (alist) => {
			return compose(list.head, list.reverse)(alist);
		};
		var alist = 
			list.cons(1,
				list.cons(2,
					list.cons(3,
						list.empty())));
		expect(
			last(alist)
		).to.eql(
			3
		);
		next();
	});
	it('Yコンビネーター', (next) => {
		var Y = (F) => {
			return ((x) => {
				return F((y) => {
					return x(x)(y);
				});
			})((x) => {
				return F((y) => {
					return x(x)(y);
				});
			});
		};
		var factorial = Y((fact) => {
			return (n) => {
				if (n === 0) {
					return 1;
				} else {
					return n * fact(n - 1);
				}
			};
		});
		expect(
			factorial(3)   // 3 * 2 * 1 = 6
		).to.eql(
			6
		);
		next();
	});
});

describe('クロージャーを使う', () => {
	var compose = (f, g) => {
		return (arg) => {
			return f(g(arg));
		};
	};
	it('クロージャーとしてのcounter関数', (next) => {
		var counter = (init) => {
			var countingNumber = init;
			// countingNumberの環境をもつクロージャーを返す
			return (_) => {
			//	countingNumber = countingNumber + 1;
			//	return countingNumber;
				return ++countingNumber;
			};
		};
		var counterFromZero = counter(0);
		expect(
			counterFromZero()
		).to.eql(
			1
		);
		expect(
			counterFromZero()
		).to.eql(
			2
		);
		expect(
			counterFromZero()
		).not.to.eql(
			counterFromZero()
		);
		next();
	});
	it('不変なオブジェクト型', (next) => {
		var object = {
			empty: (_) => {
				return null;
			},
			set: (key, value) => {
				return (obj) => {
					return (queryKey) => {
						if (key === queryKey) {
							return value;
						} else {
							return object.get(queryKey)(obj);
						}
					};
				};
			},
			get: (key) => {
				return (obj) => {
					return obj(key);
				};
			}
		};
		var robots = compose(
			object.set("C3PO", "Star Wars"),
			object.set("HAL9000", "2001: a space odessay")
		)(object.empty);
        // robots = (queryKey) => { if() { } else { } };
        
		expect(
			object.get("HAL9000")(robots)
		).to.eql(
			"2001: a space odessay"
		);

        expect(
            robots("C3PO")
        ).to.eql(
			"Star Wars"
        );
		expect(
			object.get("鉄腕アトム")(robots)
		).to.eql(
			null
		);
        
		next();
	});
    it('ストリームからジェネレータをつくる', (next) => {

        /* enumFrom(1) = 1, 2, 3, 4... */
        var enumFrom = (n) => {
	        return stream.cons(n, (_) => {
		        return enumFrom(n + 1);
	        });
        };

        var generate = (aStream) => {
            // いったんローカル変数にストリームを格納する
            var _stream = aStream;
            // ジェネレータ関数が返る
            return (_) => {
                return stream.match(_stream, {
                    empty: () => {
                        return null;
                    },
                    cons: (head, tailThunk) => {
                        _stream = tailThunk();
                        return head;
                    }
                });
            };
        };
        // 無限の整数列を生成する
        
        var integers = enumFrom(0);
        // 無限ストリームからジャネレータを生成する
        var intGenerator = generate(integers);

        expect(
            intGenerator()
        ).to.eql(
            0
        );
        expect(
            intGenerator()
        ).to.eql(
            1
        );
        expect(
            intGenerator()
        ).to.eql(
            2
        );
        next();
    });
    it('ストリームのfilter関数', (next) => {
        var generate = (aStream) => {
            // いったんローカル変数にストリームを格納する
            var _stream = aStream;
            // ジェネレータ関数が返る
            return (_) => {
                return stream.match(_stream, {
                    empty: () => {
                        return null;
                    },
                    cons: (head, tailThunk) => {
                        _stream = tailThunk();
                        return head;
                    }
                });
            };
        };
		// エラトステネスのふるいによる素数の生成
		var sieve = (aStream) => {
			return stream.match(aStream, {
				empty: () => {
					return null;
				},
				cons: (head, tailThunk) => {
					return stream.cons(head, (_) => {
						return sieve(stream.remove(
							(item) => {
								// itemで割り切れたら true
								return multipleOf(head)(item);
							}
						)(tailThunk()));
					});
				}
			});
		};
		var primes = sieve(stream.enumFrom(2));
		expect(
			stream.toArray(stream.take(primes)(10))
		).to.eql(
			[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
		);

        var enumFrom = (n) => {
	        return stream.cons(n, (_) => {
		        return enumFrom(n + 1);
	        });
        };
        var integers = enumFrom(1);
        expect(
            stream.toArray(stream.take(integers)(3))
        ).to.eql(
            [1, 2, 3]
        );

		var primeGenerator = generate(primes);
		// -------- TEST --------------
		expect(primeGenerator()).to.eql(
			2
		);
		expect(primeGenerator()).to.eql(
			3
		);
		expect(primeGenerator()).to.eql(
			5
		);
		expect(primeGenerator()).to.eql(
			7
		);
		expect(primeGenerator()).to.eql(
			11
		);
		next();
    });
	it('ES6におけるジェネレータ', (next) => {
		function* genCounter(){
			yield 1;
			yield 2;
			return 3;
		};
		var counter = genCounter();
		expect(
			counter.next().value
		).to.eql(
			1
		);
		expect(
			counter.next().value
		).to.eql(
			2
		);
		expect(
			counter.next().value
		).to.eql(
			3	
		);
		next();
	});
	describe('クロージャの純粋性', () => {
		it('multipleOf関数の参照透過性', (next) => {
			expect(
				multipleOf(2)(4)
			).to.eql(
				multipleOf(2)(4)
			);
			expect(
				multipleOf(3)(5)
			).to.eql(
				multipleOf(3)(5)
			);
			next();
		});
		it('カウンターをクロージャーで定義する', (next) => {
			// チャーチ数
			var zero = (f) => {
				return (x) => {
					return x;
				};
			};
			var one = (f) => {
				return (x) => {
					return f(x);
				};
			};
			var two = (f) => {
				return (x) => {
					return f(f(x));
				};
			};
			var three = (f) => {
				return (x) => {
					return f(f(f(x)));
				};
			};
            /*
			var succ = (n) => {
				return (f) => {
					return (x) => {
						return f(n(f)(x));
					};
				};
			};
            */
            var succ = (n) => {
                return n + 1;
            };
			var add = (m) => {
				return (n) => {
					return (f) => {
						return (x) => {
							return m(f)(n(f)(x));
						};
					};
				};
			};
			var counter = (init) => {
				var _init = init;
				return (_) => {
					_init = _init + 1;
					return _init;
				};
			};
            var getCount = counter(0);

            expect( counter(0)() ).to.eql( 1 );
            expect( counter(0)() ).to.eql( 1 );
            expect( counter(0)() ).to.eql( 1 );

            expect( getCount() ).to.eql( 1 );
            expect( getCount() ).to.eql( 2 );
            expect( getCount() ).to.eql( 3 );

            
            expect( zero(succ)(0) ).to.eql( 0 );
            expect( one(succ)(0)  ).to.eql( 1 );
            expect( two(succ)(0)  ).to.eql( 2 );
            expect( three(succ)(0)).to.eql( 3 );

            expect(
				one(counter(0))(0)
			).to.eql(
				1
			);
			expect(
				two(counter(0))(0)
			).to.eql(
				2
			);
			expect(
				add(one)(two)(counter(0))(0)
			).to.eql(
				3
			);

			next();
		});
	});
});

describe('関数を渡す', () => {
    describe('コールバック関数で処理をモジュール化する', () => {
        var succ = (n) => {
            return n + 1;
        };
	    var compose = (f, g) => {
		    return (arg) => {
			    return f(g(arg));
		    };
	    };
        it('直接的な呼び出しの例', (next) => {
            var doCall = (arg) => {
                return succ(arg);
            };
            expect( doCall(2) ).to.eql( 3 );
            next();
        });
        it('単純なコールバックの例', (next) => {
            var setupCallback = (callback) => {
                // コールバック関数を実行する無名関数を返す
                return (arg) => {
                    return callback(arg);
                };
            };
            // コールバック関数を設定する
            var doCallback = setupCallback(succ);
            expect( doCallback(2) ).to.eql( 3 );
            next();
        });
        it('リストのmap関数の定義', (next) => {
            // map:: FUN[T => T] => LIST[T] => LIST[T]
            var map = (callback) => {
                return (alist) => {
                    return list.match(alist, {
                        empty: (_) => {
                            return list.empty();
                        },
                        cons: (head, tail) => {
                            // コールバック関数を実行する
                            return list.cons(callback(head),
                                             map(callback)(tail));
                        }
                    });
                };
            };
            // map関数の処理の対象となる数値のリスト
            var numbers = list.cons(1,
                                    list.cons(2,
                                              list.cons(3,
                                                        list.empty())));
            // 要素を2倍するmap処理
            var mapDouble = map( (n) => {
                return n * 2;
            });
            expect(
                compose(list.toArray, mapDouble)(numbers)
            ).to.eql(
                [2, 4, 6]
            );

            // 要素を2乗するmap処理
            var mapSquare = map( (n) => {
                return n * n;
            });
            expect(
                compose(list.toArray, mapSquare)(numbers)
            ).to.eql(
                [1, 4, 9]
            );
            next();
        });
    });
	describe('畳み込み関数に関数を渡す', (next) => {
		var numbers = list.cons(1,
			                    list.cons(2,
				                          list.cons(3,
					                                list.empty())));
		it('sum関数の定義', (next) => {
			expect (
				list.sum(numbers)(0)
			).to.eql(
				6
			);
			next();
		});
		it('sumWithCallback関数のテスト', (next) => {
			var callback = (n) => {
				return (m) => {
					return n + m;
				};
			};
			expect(
				list.sumWithCallback(numbers)(0)(callback)
			).to.eql(
				6
			);
			next();
		});
		it('length関数の定義', (next) => {
			expect(
				list.length(numbers)(0)
			).to.eql(
				3
			);
			next();
		});
		it('lengthWithCallback関数でリストの長さをテストする', (next) => {
			var callback = (n) => {
				return (m) => {
					return 1 + m;
				};
			};
			expect(
				list.lengthWithCallback(numbers)(0)(callback)
			).to.eql(
				3
			);
			next();
		});
		it('foldr関数によるsum関数とlength関数の定義', (next) => {
			var sum = (alist) => {
				return list.foldr(alist)(0)( (item) => {
					return (accumulator) => {
						return accumulator + item;
					};
				});
			};
            expect(
                sum(numbers)
            ).to.eql(
                6
            );
            var length = (alist) => {
                return list.foldr(alist)(0)( (item) => {
                    return (accumulator) => {
                        return accumulator + 1;
                    };
                });
            };
            expect(
                length(numbers)
            ).to.eql(
                3
            );
            next();
		});
        it('foldr関数によるreverse関数の定義', (next) => {
            var reverse = (alist) => {
                return list.foldr(alist)(list.empty())((item) => {
                    return (accumulator) => {
                        // return list.append(accumulator)(list.cons(item, list.empty()));
                        return list.cons(item, accumulator);
                    };
                });
            };
            expect(
                list.empty()
            ).to.eql(
                []
            );
            expect(
                list.toArray(list.reverse(numbers))
            ).to.eql(
                [3, 2, 1]
            );
            next();

        });
        it('foldr関数によるfind関数の定義', (next) => {
            var find = (alist) => {
                return (predicate) => {
                    return list.foldr(alist)(null)((item) => {
                        return (accumulator) => {
                            if (predicate(item) === true) {
                                return item;
                            } else {
                                return accumulator;
                            }
                        };
                    });
                };
            };
            expect(
                find(numbers)(even)
            ).to.eql(
                2
            );
            next();
        });
        it('reduceメソッドによるfromArray関数', (next) => {
            var fromArray = (array) => {
                return array.reduce((accumulator, item) => {
                    return list.append(accumulator)(list.cons(item, list.empty()));
                }, list.empty());
            };
            next();
        });
	});

});
