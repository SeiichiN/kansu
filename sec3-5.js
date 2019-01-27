var expect = require('expect.js');

var prTest = () => {
	console.log(
"======================= TEST ==========================\n"
	);
};

var succ = (n) => {
	return n + 1;
};

var anArray = [2, 3, 5, 7];
var sum = (array) => {
	var result = 0;
	for (var index = 0; index < array.length; index++) {
		result = result + array[index];
	}
	return result;

};

var sum = (array) => {
	var result = 0;
	array.forEach((item) => {
		result = result + item;
	});
	return result;
};

var sum = (array) => {
    return array.reduce((accumulator, item) => {
        return accumulator + item;
    }, 0);
};

var reverse = (array) => {
    return array.reduce((accumulator, item) => {
        return [item].concat(accumulator);
    }, []);
};
var array = [1, 2, 3, 4, 5];
 
var empty = () => {
	return (pattern) => {
		return pattern.empty();
	};
};

var cons = (value, list) => {
	return (pattern) => {
		return pattern.cons(value, list);
	};
};

var match = (data, pattern) => {
	return data(pattern);
};

var isEmpty = (alist) => {
	return match(alist, {
		empty: (_) => {
			return true;
		},
		cons: (head, tail) => {
			return false;
		}
	});
};

var head = (alist) => {
	return match(alist, {
		empty: (_) => {
			return null;
		},
		cons: (head, tail) => {
			return head;
		}
	});
};

var tail = (alist) => {
	return match(alist, {
		empty: (_) => {
			return null;
		},
		cons: (head, tail) => {
			return tail;
		}
	});
};

var counter = 0;
while (counter < 10) {
	counter = counter + 1;
}

// TEST
expect(
	counter
).to.eql(
	10
);

for (var counter = 0; counter < 10; counter += 1) {
	;
}

expect(
	counter
).to.eql(
	10
);

var length = (array) => {
	var result = 0;
	array.forEach((element) => {
		result += 1;
	});
	return result;
};
expect(
	length([1, 2, 3, 4, 5])
).to.eql(
	5
);

/**
 * Hukuri keisan
 * @param: int a -- gankin
 *         float r -- riritsu
 *         int n -- years
 * @return: float Kingaku
 */
describe("複利計算", () => {
	it ("計算", () => {
		var compoundInterest = (a, r, n) => {
			if (n === 0) {
				return a;
			} else {
				return compoundInterest(a, r, n - 1) * (1 + r);
			}
		};
		expect(
			compoundInterest(100000, 0.02, 2)
		).to.eql(
			104040
		);
	});
});
/* ----- end of Hukuri keisan -----*/

/**
 * map by saiki
 * match -- defined at L56
 * empty -- defined at L44
 * cons  -- defined at L50
 * succ  -- defined at L9
 */
describe("再帰による反復処理", () => {
	// p.152 list_5.21
	it("再帰によるmap関数", (next) => {
		var map = (alist, transform) => {
			return match(alist, {
				empty: (_) => { return empty(); },
				cons: (head, tail) => {
					return cons(transform(head),
						map(tail, transform));
				}

			});
		};
		// 再帰によるtoArray関数
		var toArray = (alist) => {
			// 補助関数 toArrayHelper
			var toArrayHelper = (alist, accumulator) => {
				return match(alist, {
					empty: (_) => { return accumulator; },
					cons: (head, tail) => {
						return toArrayHelper(tail, accumulator.concat(head));
					}
				});
			};
			return toArrayHelper(alist, []);
		};
		expect(
			toArray(map(cons(1, cons(2, cons(3, empty()))), succ))
		).to.eql(
			[2, 3, 4]
		);
		expect(
			toArray(cons(1, cons(2, cons(3, empty()))))
		).to.eql(
			[1, 2, 3]
		);
		next();
	});
	/* ---------------------------------------- */
	it ("再帰によるlength関数", (next) => {
		var length = (list) => {
			return match(list, {
				empty: (_) => {
					return 0;
				},
				cons: (head, tail) => {
					return 1 + length(tail);
				}
			});
		};
		expect(
			length(cons(1, cons(2, cons(3, empty()))))
		).to.eql(
			3	
		);
		next();
	});
	/* ----------------------------------------*/
	it ("再帰によるappend関数", (next) => {
// 		var match = (exp, pattern) => {
// 			return exp.call(pattern, pattern);
// 		};
		var toArray = (alist) => {
			// 補助関数 toArrayHelper
			var toArrayHelper = (alist, accumulator) => {
				return match(alist, {
					empty: (_) => { return accumulator; },
					cons: (head, tail) => {
						return toArrayHelper(tail, accumulator.concat(head));
					}
				});
			};
			return toArrayHelper(alist, []);
		};
		var append = (xs, ys) => {
			return match(xs, {
				empty: (_) => {
					return ys;
				},
				cons: (head, tail) => {
					return cons(head, append(tail, ys));
				}
			
			});
		};
		var xs = cons(1, cons(2, empty()));
		var ys = cons(3, cons(4, empty()));
		expect(
			toArray(append(xs, ys))
		).to.eql(
			[1, 2, 3, 4]			
		);
		next();
	});

	it ("再帰によるreverse関数", () => {
		var toArray = (alist) => {
			// 補助関数 toArrayHelper
			var toArrayHelper = (alist, accumulator) => {
				return match(alist, {
					empty: (_) => { return accumulator; },
					cons: (head, tail) => {
						return toArrayHelper(tail, accumulator.concat(head));
					}
				});
			};
			return toArrayHelper(alist, []);
		};
		var reverse = (list) => {
			var reverseHelper = (list, accumulator) => {
				return match(list, {
					empty: (_) => {
						return accumulator;
					},
					cons: (head, tail) => {
						return reverseHelper(tail, cons(head, accumulator));
					}
				});
			};
			return reverseHelper(list, empty());
		};
		expect(
			toArray(reverse(cons(1, cons(2, cons(3, empty())))))
		).to.eql(
			[3, 2, 1]
		);
	});

	it ("代数的データ構造による数式",  () => {
		var num = (n) => {
			return (pattern) => {
				return pattern.num(n);
			};
		};
		var add = (exp1, exp2) => {
			return (pattern) => {
				return pattern.add(exp1, exp2);
			};
		};
		var mul = (exp1, exp2) => {
			return (pattern) => {
				return pattern.mul(exp1, exp2);
			};
		};
		var calculate = (exp) => {
			return match(exp, {
				num: (n) =>  {
					return n;
				},
				add: (expL, expR) => {
					return calculate(expL) + calculate(expR);
				},
				mul: (expL, expR) => {
					return calculate(expL) * calculate(expR);
				}
			});
		};
		// 1 + ( 2 * 3 )を計算する
		var expression = add(num(1), mul(num(2), num(3)));
		expect(
			calculate(expression)
		).to.eql(
			7
		);
	});

	// length(append(xs, ys)) === length(xs) + length(ys)
	it ("命題P", () => {
		var length = (list) => {
			return match(list, {
				empty: (_) => {
					return 0;
				},
				cons: (head, tail) => {
					return 1 + length(tail);
				}
			});
		};
		var append = (xs, ys) => {
			return match(xs, {
				empty: (_) => {
					return ys;
				},
				cons: (head, tail) => {
					return cons(head, append(tail, ys));
				}
			
			});
		};
		var xs = cons(1, cons(2, empty()));
		var ys = cons(3, cons(4, empty()));
		expect(
			length(append(xs, ys))
		).to.eql(
			length(xs) + length(ys)
		);
	});
	it ("命題P2", () => {
		var length = (list) => {
			return match(list, {
				empty: (_) => {
					return 0;
				},
				cons: (head, tail) => {
					return 1 + length(tail);
				}
			});
		};
		var append = (xs, ys) => {
			return match(xs, {
				empty: (_) => {
					return ys;
				},
				cons: (head, tail) => {
					return cons(head, append(tail, ys));
				}
			
			});
		};
		var xs = cons(1, cons(2, empty()));
		var ys = cons(3, cons(4, empty()));
		var xxs = cons(5, xs);
		expect(
			length(append(xxs, ys))
		).to.eql(
			length(xxs) + length(ys)
		)
	});
});
