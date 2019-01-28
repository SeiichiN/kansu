"use strict";
// sec7.js
// 高階関数を活用する

var expect = require('expect.js');

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
					return cons(head, append(tail, ys));
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
