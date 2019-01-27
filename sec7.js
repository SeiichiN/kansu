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
});
