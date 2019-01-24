var succ = (n) => {
	return n + 1;
};

var prev = (n) => {
	return n - 1;
};

var add = (x, y) => {
	if (y < 1) {
		return x;
	} else {
		return add(succ(x), prev(y));
	}
};

var times = (count, fun, arg, memo) => {
	if (count > 1) {
		/* times関数を再帰呼出し */
		return times(count - 1, fun, arg, fun(memo, arg));
	} else {
		return fun(memo, arg);
	}
};

var multiply = (n, m) => {
	/* ２番めの引数にadd関数を渡している */
	return times(m, add, n, 0);
};

var sum = (array) => {
	var result = 0;
	array.forEach((item) => {
		result = result + item;
	});
	return result;
};

var adder = (n) => {
	return (m) => {
		return n + m;
	};
};

var constant = (any) => {
	return (_) => {
		return any;
	};
};
var alwaysOne = constant(1);

var length = (array) => {
    return sum(map(alwaysOne)(array));

};



var product = (array) => {
	return array.reduce(
		(accumulator, item) => {
			return accumulator * item;
		}, 1);
};

/**
 * 配列の各要素について、ある処理をおこない、新しい配列を返す
 * Usage: map(transform)(array)
 * @param: transform -- 処理をおこなう関数
 *         array -- 処理の対象となる配列
 * @return: array
 */
/*
var map = (transform) => {
	return (array) => {
		return array.reduce(
			(accumulator, item) => {
				return accumulator.concat(transform(item));
			}, []);
	};
};
*/

var aStream = [1, (_) => {
	return 2;
}];

/**
 * n, n+1, n+2, n+3,...... というストリームを生成する
 */
var enumFrom = (n) => {
	return [n, (_) => {
		return enumFrom(succ(n));
	}];
};

var evenFrom = (n) => {
 	return [n, (_) => {
 		return evenFrom(n + 2);
 	}];
};
var evenStream = evenFrom(2);

/*
 * Usage: iterate(init)(step)
 * @param: init -- 初期値
 *         step -- 増減の処理を記述した関数
 * @return: init を初期値とした数値のならび（ストリーム）
 */
var iterate = (init) => {
	return (step) => {
		return [init, (_) => {
			return iterate(step(init))(step);
		}];
	};
};

/*
 * iterate関数を使って、enumFromを書き直す
 */
var enumFrom = (n) => {
	return iterate(n)(succ);
};

var naturals = enumFrom(1);

var twoStep = (n) => {
	return n + 2;
};

var evenStream = iterate(2)(twoStep);

/**
 * ストリームのfilter関数
 *
 * @param: predicate -- 条件となる関数
 *         aStream -- [1, (_)=>{return 2;}] というような配列
 * @return: array -- 条件に合致した数からなる配列
 */
var filter = (predicate) => {
    return (aStream) => {
        // ストリームの先頭要素を取り出す
        var head = aStream[0];
        // 先頭要素が条件に合致する場合
        if (predicate(head) === true) {
            return [head, (_) => {
                return filter(predicate)(aStream[1]());
            }];
        } else {
            // 先頭要素が条件に合致しない場合
            return filter(predicate)(aStream[1]());
        }
    };
};

/***********************************************
 * filter関数で無限の偶数列をつくる
 ***********************************************/
/**
 * ２で割り切れるかどうか
 * @param: n -- 数
 * @return: boolean true/false 
 */
var even = (n) => {
    return (n % 2) === 0;
};

/**
 *
 */
var evenStream = filter(even)(enumFrom(1));

/**
 * ストリームのn番目の要素を返す関数
 *
 * @params: n -- 数
 *          aStream -- 無限に続く配列
 */
var elemAt = (n) => {
    return (aStream) => {
        if (n === 1) {
            return aStream[0];
        } else {
            return elemAt(n-1)(aStream[1]());
        }
    };
};

/**
 * 配列版のeleAt関数
 */
/*
var elemAt = (n) => {
    return (anArray) => {
        if (n === 1) {
            return anArray[0];
        } else {
            var tail = anArray.slice(1, anArray.length);
            return elemAt(n-1)(tail);
        }
    };
};
*/

/**
 * ストリームのmap関数
 * Usage: map(transform)(aStream)
 * @param: transform -- 処理を記述した関数
 *         aStream -- 処理の対象となるストリーム
 * @return: aStream
 */
var map = (transform) => {
    return (aStream) => {
        var head = aStream[0];
        return [transform[head], (_) => {
            return map(transform)(aStream[1]());
        }];
    };
};

/**
 * ストリームの先頭から引数n分だけ取り出すtake関数
 * Usage: take(n)(aStream)
 * @param: n -- 数
 *         aStream -- 数のならび
 * @return: ストリーム
 */
var take = (n) => {
    return (aStream) => {
        if (n === 0) {
            return null;
        } else {
            return [aStream[0], (_) => {
                return take(n - 1)(aStream[1]());
            }];
        }
    };
};

/**
 * ストリームの全ての要素がtrueであるかを判定するall関数
 */
var all = (aStream) => {
    var allHelper = (aStream, accumulator) => {
        var head = aStream[0];
        var newAccumulator = accumulator && head;
        if (aStream[1]() == null) {
            return newAccumulator;
        } else {
            return allHelper(aStream[1](), newAccumulator);
        }
    };
    return allHelper(aStream, true);
};

/**
 * 検証の対象となる命題
 */
var proposition = (n) => {
    return succ(0) + succ(n) === succ(succ(n));
};


