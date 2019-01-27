"use strict";

// 第6章 関数を利用する

var expect = require('expect.js');

describe('関数の基本', () => {
	describe('関数を定義する', () => {
		it('恒等関数', (next) => {
			var identity = (any) => {
				return any;
			};		
			expect (
				identity(1)
			).to.eql(
				1
			);
			expect (
				identity("a")
			).to.eql(
				"a"
			);
			next();	
		});
		
		it('succ関数', (next) => {
			/* succ:: NUM => NUM */
			var succ = (n) => {
				return n + 1;
			};
			expect (
				succ(1)
			).to.eql (
				2
			);
			expect (
				succ("a")
			).to.eql (
				"a1"
			);
			next();
		});
		it('add関数', (next) => {
			/* add:: (NUM, NUM) => NUM */
			var add = (n, m) => {
				return n + m;
			};
			expect(
				add(1, 2)
			).to.eql(
				3
			);
			next();
		});

		it ('定数関数', (next) => {
			var alwaysOne = (x) => {
				return 1;
			};
			expect(
				alwaysOne(2)
			).to.eql(
				1
			);
			expect(
				alwaysOne("a")
			).to.eql(
				1
			);
			next();
		});

		it ('left定数', (next) => {
			var left = (x, y) => {
				return x;
			};
			expect(
				left(1, 2)
			).to.eql(
				1
			);
			next();
		});
	});
	describe('関数を適用する', () => {
		describe('関数の評価戦略', () => {
			it('JavaScriptにおける正格評価', (next) => {
				var left = (x, y) => {
					return x;
				};
				var infiniteLoop = (_) => {
					return infiniteLoop(_);
				};
				/*
				expect(
					left(1, infiniteLoop())
				).to.eql(
					1
				);
				*/
				next();
			});
			
			it('条件文と遅延評価', (next) => {
				var infiniteLoop = (_) => {
					return infiniteLoop(_);
				};
				var conditional = (n) => {
					if (n === 1) {
						return true;
					} else {
						return infiniteLoop();
					}
				};
				expect (
					conditional(1)
				).to.eql(
					true	
				);
				next();	
			});

			it('遅延評価で定義したmultiply関数', (next) => {
				var lazyMultiply = (funX, funY) => {
					var x = funX();

					if (x === 0) {
						return 0;
					} else {
						return x * funY();
					}
				};
				expect (
					lazyMultiply( (_) => {
						return 0;
					}, (_) => {
						return infiniteLoop();
					} )
				).to.eql (
					0
				);
				next();	
			});
		});

		describe ('サンクによるストリーム型の定義', () => {
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
				isEmpty: (alist) => {
					return match(alist, {
						empty: (_) => {
							return true;
						},
						cons: (head, tail) => {
							return false;
						}
					});
				},
				head:  (alist) => {
					return match(alist, {
						empty: (_) => {
							return null;
						},
						cons: (head, tail) => {
							return head;
						}
					});
				},
				tail: (alist) => {
					return match(alist, {
						empty: (_) => {
							return null;
						},
						cons: (head, tail) => {
							return tail;
						}
					});
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
				}
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
				take: (aStream, n) => {
					return stream.match(aStream, {
						empty: (_) => {
							return list.empty();
						},
						cons: (head, tailThunk) => {
							if (n === 0) {
								return list.empty();
							} else {
								return  list.cons(head,
									stream.take(tailThunk(), (n - 1)));
							}
						}
					});
				}
			};
			it('ストリーム型のテスト', (next) => {
				var theStream = stream.cons(1, (_) => {
					return stream.cons(2, (_) => {
						return stream.empty();
					});
				});
				expect (
					stream.head(theStream)
				).to.eql (
					1
				);
				next();
			}); 
			it("無限に続くストリームを作る", (next) => {
				/* ones = 1, 1, 1, 1.... */
				var ones = stream.cons(1, (_) => {
					return ones;
				});
				expect(
					stream.head(ones)   // 1st element
				).to.eql(
					1
				);
				expect(
					stream.head(stream.tail(ones))  // 2nd Element
				).to.eql(
					1
				);
				/* enumFrom(1) = 1, 2, 3, 4... */
				var enumFrom = (n) => {
					return stream.cons(n, (_) => {
						return enumFrom(n + 1);
					});
				};
				expect(
					stream.head(enumFrom(1))   // 1st element
				).to.eql(
					1
				);
				expect(
					stream.head(stream.tail(enumFrom(1)))  // 2nd Element
				).to.eql(
					2
				);
				next();
			});	
			it("enumFrom関数のテスト", (next) => {
				/* enumFrom(1) = 1, 2, 3, 4... */
				var enumFrom = (n) => {
					return stream.cons(n, (_) => {
						return enumFrom(n + 1);
					});
				};
				// ------------ TEST ---------------
				expect(
					list.toArray(
						stream.take(enumFrom(1), 4)
					)
				).to.eql(
					[1, 2, 3, 4]
				);
				next();
			});
		});
	});
	describe("関数の純粋性", () => {
		it("ファイル操作は参照透過性を破壊する", () => {
			// fsモジュールを変数fsにバインドする
			var fs = require('fs');

			// テストの実行前にあらかじめ "This is a tes."という文字列を
			// ファイルに書き込んでおく。
			fs.writeFileSync('resources/file.txt', "This is a test.");

			// 1回目のファイルの読み込み
			var text = fs.readFileSync('resources/file.txt', 'utf8');
			expect(
				fs.readFileSync('resources/file.txt', 'utf8')
			).to.eql(
				"This is a test."
			);

			// 途中でのファイルへの書き込み
			fs.writeFileSync('resources/file.txt', "This is another test.");

			// 2回めのファイルの読み込み
			expect(
				fs.readFileSync('resources/file.txt', 'utf8')
			).to.eql(
				"This is another test."
			);
		});
	});
});

