"use strict";
// sec7.js
// 高階関数を活用する

var expect = require('expect.js');

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
});
