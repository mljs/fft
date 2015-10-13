'use strict';
var FFTUtils = require("../src/FFTUtils");

describe('FFT', function () {
    it('should return the same', function () {
        var n = 4;
        var nRows = n;
        var nCols = n;
        var data = new Array(nRows*nCols);
        for(var i=0;i<nRows;i++){
            for(var j=0;j<nCols;j++){
                data[i*nCols+j]=i+j;
            }
        }
        var ftData = FFTUtils.fft2DArray(data, nCols, nCols);
        var ftRows = nRows * 2;
        var ftCols = nCols / 2 + 1;

        var iftData =  FFTUtils.ifft2DArray(ftData, ftRows, ftCols);
        for(var i=0;i<nRows;i++){
            for(var j=0;j<nCols;j++){
                data[i*nCols+j].should.be.equal(iftData[i*nCols+j]);
            }
        }
    });
});
