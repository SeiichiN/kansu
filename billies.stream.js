// billies.stream.js

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
module.exports = stream;
