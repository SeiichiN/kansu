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
