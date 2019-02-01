"use strict";

var expect = require('expect.js');

describe('非同期処理にコールバック関数を渡す', () => {
    it('tarai関数の定義', (next) => {
        var tarai = (x, y, z) => {
            if (x > y) {
                return tarai(tarai(x - 1, y, z),
                             tarai(y - 1, z, x),
                             tarai(z - 1, x, y));
            } else {
                return y;
            }
        };
        expect(
            tarai(1 * 2, 1, 0)
        ).to.eql(
            2
        );
        next();
    });
});
