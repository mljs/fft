import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to';

import { FFT, FFTUtils } from '../index';

expect.extend({ toBeDeepCloseTo, toMatchCloseTo });

describe('FFT', function () {
  it('2D FFT + IFFT should return the same', function () {
    let n = 4;
    let nRows = n;
    let nCols = n;
    let data = new Array(nRows * nCols);
    let i, j;
    for (i = 0; i < nRows; i++) {
      for (j = 0; j < nCols; j++) {
        data[i * nCols + j] = i + j;
      }
    }
    let ftData = FFTUtils.fft2DArray(data, nCols, nCols);
    let ftRows = nRows * 2;
    let ftCols = nCols / 2 + 1;

    let iftData = FFTUtils.ifft2DArray(ftData, ftRows, ftCols);

    expect(data).toMatchCloseTo(iftData, 1e-8);
  });

  it('1D FFT + IFFT should return the same', function () {
    let n = 16;
    let nCols = n;

    FFT.init(nCols);

    let re = new Array(nCols);
    let im = new Array(nCols);
    let i;
    for (i = 0; i < nCols; i++) {
      re[i] = i;
      im[i] = nCols - i - 1;
    }

    FFT.fft(re, im);
    FFT.ifft(re, im);

    for (i = 0; i < nCols; i++) {
      expect(re[i]).toBeDeepCloseTo(i, 0);
      expect(im[i]).toBeDeepCloseTo(nCols - i - 1, 10);
    }
  });

  it('Test utils Crop', function () {
    let nRows = 15;
    let nCols = 32;
    let data = new Array(nRows * nCols);
    for (let i = 0; i < nRows; i++) {
      for (let j = 0; j < nCols; j++) {
        data[i * nCols + j] = i + j;
      }
    }

    let radix2 = FFTUtils.toRadix2(data, nRows, nCols);
    let cropped = FFTUtils.crop(
      radix2.data,
      radix2.rows,
      radix2.cols,
      nRows,
      nCols,
    );
    expect(cropped).toHaveLength(nCols * nRows);
    expect(radix2.data).toHaveLength(radix2.cols * radix2.rows);
  });

  it('Test utils toRadix2', function () {
    let nRows = 15;
    let nCols = 32;
    let data = new Array(nRows * nCols);
    for (let i = 0; i < nRows; i++) {
      for (let j = 0; j < nCols; j++) {
        data[i * nCols + j] = i + j;
      }
    }

    let radix2 = FFTUtils.toRadix2(data, nRows, nCols);
    expect(radix2.cols).toBe(32);
    expect(radix2.rows).toBe(16);
  });
});
