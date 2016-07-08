'use strict';

var lib = require('../src/index');
var FFTUtils = lib.FFTUtils;
var FFT = lib.FFT;

describe('FFT', function () {
    it('2D FFT + IFFT should return the same', function () {
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

    it('1D FFT + IFFT should return the same', function () {

        var n = 16;
        var nCols = n;

        FFT.init(nCols);

        var re = new Array(nCols);
        var im = new Array(nCols);
        for(var i=0;i<nCols;i++){
            re[i]=i;
            im[i]=nCols-i-1;
        }

        FFT.fft(re, im);
        FFT.ifft(re, im);

        for(var i=0;i<nCols;i++){
            re[i].should.be.approximately(i,10e-10);
            im[i].should.be.approximately(nCols-i-1,10e-10);
        }
    });

    it('Test utils Crop', function () {
        var nRows = 15;
        var nCols = 32;
        var data = new Array(nRows*nCols);
        for(var i=0;i<nRows;i++){
            for(var j=0;j<nCols;j++){
                data[i*nCols+j]=i+j;
            }
        }

        var radix2 = FFTUtils.toRadix2(data, nRows, nCols);
        var cropped = FFTUtils.crop(radix2.data, radix2.rows, radix2.cols, nRows, nCols);
        cropped.length.should.equal(nCols*nRows);
        radix2.data.length.should.equal(nCols*nRows);
    });

    it('Test utils toRadix2', function () {
        var nRows = 15;
        var nCols = 32;
        var data = new Array(nRows*nCols);
        for(var i=0;i<nRows;i++){
            for(var j=0;j<nCols;j++){
                data[i*nCols+j]=i+j;
            }
        }

        var radix2 = FFTUtils.toRadix2(data, nRows, nCols);
        radix2.cols.should.equal(32);
        radix2.rows.should.equal(16);
    });
});
