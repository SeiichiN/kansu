var succ = (x) => {
	return x + 1;
};

var sum = (array) => {
	var result = 0;
	array.forEach((item) => {
		result = result + item;
	});
	return result;
};

var sum2 = (array) => {
	return array.reduce(
		(accumulator, item) => {
			return accumulator + item;
		}, 0);
};

var product = (array) => {
	return array.reduce(
		(accumulator, item) => {
			return accumulator * item;
		}, 1);
};

var map = (transform) => {
	return (array) => {
		return array.reduce(
			(accumulator, item) => {
				console.log(transform(item));
				return accumulator.concat(transform(item));
			}, []);
	};
};

