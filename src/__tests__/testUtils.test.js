import { toMatchCloseTo } from 'jest-matcher-deep-close-to';

import { FFTUtils } from '../index';

expect.extend({ toMatchCloseTo });

describe('FFTUtils', function () {
  it('crop', function () {
    let data = [
      9,
      10,
      11,
      11,
      11,
      10,
      9,
      9,
      9,
      10,
      11,
      11,
      11,
      10,
      9,
      9,
      9,
      11,
      15,
      17,
      15,
      11,
      9,
      9,
      9,
      11,
      17,
      21,
      17,
      11,
      9,
      9,
      9,
      11,
      15,
      17,
      15,
      11,
      9,
      9,
      9,
      10,
      11,
      11,
      11,
      10,
      9,
      9,
      9,
      10,
      11,
      11,
      11,
      10,
      9,
      9,
      9,
      10,
      13,
      14,
      13,
      10,
      9,
      9,
    ];

    let nRows = 8;
    let nCols = 8;

    let cropped = FFTUtils.crop(data, nRows, nCols, 5, 7);

    expect(Array.from(cropped)).toMatchCloseTo(
      [
        9,
        10,
        11,
        11,
        11,
        10,
        9,
        9,
        11,
        15,
        17,
        15,
        11,
        9,
        9,
        11,
        17,
        21,
        17,
        11,
        9,
        9,
        11,
        15,
        17,
        15,
        11,
        9,
        9,
        10,
        11,
        11,
        11,
        10,
        9,
      ],
      1e-8,
    );
  });
});