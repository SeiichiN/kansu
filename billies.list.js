// billies.list.js


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
module.exports = list;
