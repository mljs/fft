'use strict'

var FFT = require('./fftlib');

var FFTUtils= {
    DEBUG : false,

    /**
     * Calculates the inverse of a 2D Fourier transform
     *
     * @param ft
     * @param ftRows
     * @param ftCols
     * @return
     */
    ifft2DArray : function(ft, ftRows, ftCols){
        var tempTransform = new Array(ftRows * ftCols);
        var nRows = ftRows / 2;
        var nCols = (ftCols - 1) * 2;
        // reverse transform columns
        FFT.init(nRows);
        var tmpCols = {re: new Array(nRows), im: new Array(nRows)};
        for (var iCol = 0; iCol < ftCols; iCol++) {
            for (var iRow = nRows - 1; iRow >= 0; iRow--) {
                tmpCols.re[iRow] = ft[(iRow * 2) * ftCols + iCol];
                tmpCols.im[iRow] = ft[(iRow * 2 + 1) * ftCols + iCol];
            }
            //Unnormalized inverse transform
            FFT.bt(tmpCols.re, tmpCols.im);
            for (var iRow = nRows - 1; iRow >= 0; iRow--) {
                tempTransform[(iRow * 2) * ftCols + iCol] = tmpCols.re[iRow];
                tempTransform[(iRow * 2 + 1) * ftCols + iCol] = tmpCols.im[iRow];
            }
        }

        // reverse row transform
        var finalTransform = new Array(nRows * nCols);
        FFT.init(nCols);
        var tmpRows = {re: new Array(nCols), im: new Array(nCols)};
        var scale = nCols * nRows;
        for (var iRow = 0; iRow < ftRows; iRow += 2) {
            tmpRows.re[0] = tempTransform[iRow * ftCols];
            tmpRows.im[0] = tempTransform[(iRow + 1) * ftCols];
            for (var iCol = 1; iCol < ftCols; iCol++) {
                tmpRows.re[iCol] = tempTransform[iRow * ftCols + iCol];
                tmpRows.im[iCol] = tempTransform[(iRow + 1) * ftCols + iCol];
                tmpRows.re[nCols - iCol] = tempTransform[iRow * ftCols + iCol];
                tmpRows.im[nCols - iCol] = -tempTransform[(iRow + 1) * ftCols + iCol];
            }
            //Unnormalized inverse transform
            FFT.bt(tmpRows.re, tmpRows.im);

            var indexB = (iRow / 2) * nCols;
            for (var iCol = nCols - 1; iCol >= 0; iCol--) {
                finalTransform[indexB + iCol] = tmpRows.re[iCol] / scale;
            }
        }
        return finalTransform;
    },
    /**
     * Calculates the fourier transform of a matrix of size (nRows,nCols) It is
     * assumed that both nRows and nCols are a power of two
     *
     * On exit the matrix has dimensions (nRows * 2, nCols / 2 + 1) where the
     * even rows contain the real part and the odd rows the imaginary part of the
     * transform
     * @param data
     * @param nRows
     * @param nCols
     * @return
     */
    fft2DArray:function(data, nRows, nCols) {
        var ftCols = (nCols / 2 + 1);
        var ftRows = nRows * 2;
        var tempTransform = new Array(ftRows * ftCols);
        FFT.init(nCols);
        // transform rows
        var tmpRows = {re: new Array(nCols), im: new Array(nCols)};
        var row1 = {re: new Array(nCols), im: new Array(nCols)}
        var row2 = {re: new Array(nCols), im: new Array(nCols)}
        var index, iRow0, iRow1, iRow2, iRow3;
        for (var iRow = 0; iRow < nRows / 2; iRow++) {
            index = (iRow * 2) * nCols;
            tmpRows.re = data.slice(index, index + nCols);

            index = (iRow * 2 + 1) * nCols;
            tmpRows.im = data.slice(index, index + nCols);

            FFT.fft1d(tmpRows.re, tmpRows.im);

            this.reconstructTwoRealFFT(tmpRows, row1, row2);
            //Now lets put back the result into the output array
            iRow0 = (iRow * 4) * ftCols;
            iRow1 = (iRow * 4 + 1) * ftCols;
            iRow2 = (iRow * 4 + 2) * ftCols;
            iRow3 = (iRow * 4 + 3) * ftCols;
            for (var k = ftCols - 1; k >= 0; k--) {
                tempTransform[iRow0 + k] = row1.re[k];
                tempTransform[iRow1 + k] = row1.im[k];
                tempTransform[iRow2 + k] = row2.re[k];
                tempTransform[iRow3 + k] = row2.im[k];
            }
        }

        //console.log(tempTransform);
        row1 = null;
        row2 = null;
        // transform columns
        var finalTransform = new Array(ftRows * ftCols);
        FFT.init(nRows);
        var tmpCols = {re: new Array(nRows), im: new Array(nRows)};
        for (var iCol = ftCols - 1; iCol >= 0; iCol--) {
            for (var iRow = nRows - 1; iRow >= 0; iRow--) {
                tmpCols.re[iRow] = tempTransform[(iRow * 2) * ftCols + iCol];
                tmpCols.im[iRow] = tempTransform[(iRow * 2 + 1) * ftCols + iCol];
                //TODO Chech why this happens
                if(isNaN(tmpCols.re[iRow])){
                    tmpCols.re[iRow]=0;
                }
                if(isNaN(tmpCols.im[iRow])){
                    tmpCols.im[iRow]=0;
                }
            }
            FFT.fft1d(tmpCols.re, tmpCols.im);
            for (var iRow = nRows - 1; iRow >= 0; iRow--) {
                finalTransform[(iRow * 2) * ftCols + iCol] = tmpCols.re[iRow];
                finalTransform[(iRow * 2 + 1) * ftCols + iCol] = tmpCols.im[iRow];
            }
        }

        //console.log(finalTransform);
        return finalTransform;

    },
    /**
     *
     * @param fourierTransform
     * @param realTransform1
     * @param realTransform2
     *
     * Reconstructs the individual Fourier transforms of two simultaneously
     * transformed series. Based on the Symmetry relationships (the asterisk
     * denotes the complex conjugate)
     *
     * F_{N-n} = F_n^{*} for a purely real f transformed to F
     *
     * G_{N-n} = G_n^{*} for a purely imaginary g transformed to G
     *
     */
    reconstructTwoRealFFT:function(fourierTransform, realTransform1, realTransform2) {
        var length = fourierTransform.re.length;

        // the components n=0 are trivial
        realTransform1.re[0] = fourierTransform.re[0];
        realTransform1.im[0] = 0.0;
        realTransform2.re[0] = fourierTransform.im[0];
        realTransform2.im[0] = 0.0;
        var rm, rp, im, ip, j;
        for (var i = length / 2; i > 0; i--) {
            j = length - i;
            rm = 0.5 * (fourierTransform.re[i] - fourierTransform.re[j]);
            rp = 0.5 * (fourierTransform.re[i] + fourierTransform.re[j]);
            im = 0.5 * (fourierTransform.im[i] - fourierTransform.im[j]);
            ip = 0.5 * (fourierTransform.im[i] + fourierTransform.im[j]);
            realTransform1.re[i] = rp;
            realTransform1.im[i] = im;
            realTransform1.re[j] = rp;
            realTransform1.im[j] = -im;
            realTransform2.re[i] = ip;
            realTransform2.im[i] = -rm;
            realTransform2.re[j] = ip;
            realTransform2.im[j] = rm;
        }
    },

    /**
     * In place version of convolute 2D
     *
     * @param ftSignal
     * @param ftFilter
     * @param ftRows
     * @param ftCols
     * @return
     */
    convolute2DI:function(ftSignal, ftFilter, ftRows, ftCols) {
        var re, im;
        for (var iRow = 0; iRow < ftRows / 2; iRow++) {
            for (var iCol = 0; iCol < ftCols; iCol++) {
                //
                re = ftSignal[(iRow * 2) * ftCols + iCol]
                * ftFilter[(iRow * 2) * ftCols + iCol]
                - ftSignal[(iRow * 2 + 1) * ftCols + iCol]
                * ftFilter[(iRow * 2 + 1) * ftCols + iCol];
                im = ftSignal[(iRow * 2) * ftCols + iCol]
                * ftFilter[(iRow * 2 + 1) * ftCols + iCol]
                + ftSignal[(iRow * 2 + 1) * ftCols + iCol]
                * ftFilter[(iRow * 2) * ftCols + iCol];
                //
                ftSignal[(iRow * 2) * ftCols + iCol] = re;
                ftSignal[(iRow * 2 + 1) * ftCols + iCol] = im;
            }
        }
    },
    /**
     *
     * @param data
     * @param kernel
     * @param nRows
     * @param nCols
     * @returns {*}
     */
    convolute:function(data, kernel, nRows, nCols){
        var ftSpectrum = new Array(nCols * nRows);
        for (var i = 0; i<nRows * nCols; i++){
            ftSpectrum[i] = data[i];
        }

        ftSpectrum = this.fft2DArray(ftSpectrum, nRows, nCols);

        var dim = kernel.length;
        var ftFilterData = new Array(nCols * nRows);
        for(var i=0;i<nCols * nRows;i++){
            ftFilterData[i]=0;
        }

        var iRow, iCol;
        var shift = (dim - 1) / 2;
        //console.log(dim);
        for (var ir = 0; ir < dim; ir++) {
            iRow = (ir - shift + nRows) % nRows;
            for (var ic = 0; ic < dim; ic++) {
                iCol = (ic - shift + nCols) % nCols;
                ftFilterData[iRow * nCols + iCol] = kernel[ir][ic];
            }
        }

        ftFilterData = this.fft2DArray(ftFilterData, nRows, nCols);

        var ftRows = nRows * 2;
        var ftCols = nCols / 2 + 1;
        this.convolute2DI(ftSpectrum, ftFilterData, ftRows, ftCols);

        return  this.ifft2DArray(ftSpectrum, ftRows, ftCols);
    },

    /**
     * ZeroFilling of the image in to make nRows and nCols radix-2
     * @param data
     * @param nRows
     * @param nCols
     */

    toRadix2:function(data, nRows, nCols){
        var output = data.slice(0, data.length);
        var i, padding;
        var cols = nCols, rows = nRows
        if(!(nCols !== 0 && (nCols & (nCols - 1)) === 0)) {
            //Then we have to make a pading to next radix2
            cols = 0;
            while((nCols>>++cols)!=0);
            cols=1<<cols;
            padding = new Array(cols-nCols);
            for(i=0;i<padding.length;i++){
                padding[i]=0;
            }
            for(i=nRows-1;i>=0;i--){
                data.splice(i*nCols,0,...padding);
            }
        }
        if(!(nRows !== 0 && (nRows & (nRows - 1)) === 0)) {
            //Then we have to make a pading to next radix2
            rows = 0;
            while((nRows>>++rows)!=0);
            rows=1<<rows;
            padding = new Array((rows-nRows)*nCols);
            for(i=0;i<padding.length;i++){
                padding[i]=0;
            }
            data.splice(data.length,0,...padding);
        }
        return {data:output, rows:rows, cols:cols};
    }
}

module.exports = FFTUtils;
