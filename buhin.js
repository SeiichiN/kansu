
var constant = (any) => {
	return (_) => {
		return any;
	};
};
var alwaysOne = constant(1);

var length = (array) => {
    return sum(map(alwaysOne)(array));
};
