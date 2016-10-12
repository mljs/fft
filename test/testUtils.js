'use strict';

var lib = require('../src/index');
var FFTUtils = lib.FFTUtils;

describe('FFTUtils', function () {
    it('crop', function () {
        var data = [9, 10, 11, 11, 11, 10, 9, 9,
            9, 10, 11, 11, 11, 10, 9, 9,
            9, 11, 15, 17, 15, 11, 9, 9,
            9, 11, 17, 21, 17, 11, 9, 9,
            9, 11, 15, 17, 15, 11, 9, 9,
            9, 10, 11, 11, 11, 10, 9, 9,
            9, 10, 11, 11, 11, 10, 9, 9,
            9, 10, 13, 14, 13, 10, 9, 9];

        var nRows = 8;
        var nCols = 8;

        var cropped = FFTUtils.crop(data, nRows, nCols, 5, 7);

        Array.from(cropped).should.eql(
            [
                9, 10, 11, 11, 11, 10, 9,
                9, 11, 15, 17, 15, 11, 9,
                9, 11, 17, 21, 17, 11, 9,
                9, 11, 15, 17, 15, 11, 9,
                9, 10, 11, 11, 11, 10, 9
            ]
        );
    });
});
