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
prTest();
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
var compoundInterest = (a, r, n) => {
	if (n === 0) {
		return a;
	} else {
		return compoundInterest(a, r, n - 1) * (1 + r);
	}
};
prTest();
expect(
	compoundInterest(100000, 0.02, 2)
).to.eql(
	104040
);

/**
 * map by saiki
 */
var map = (alist, transform) => {
	return match(alist, {
		empty: (_) => { return empty(); },
		cons: (head, tail) => {
			return cons(transform(head),
				map(tail, transform));
		}

	});
};
