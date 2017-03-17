/* global describe, it, expect */
/* eslint prefer-arrow-callback:0, func-names:0, global-require:0, import/no-extraneous-dependencies:0 */
import install from 'jasmine-es6';


install();

describe('Lock', () => {
  const Lock = require('../dist/').Lock;

  it('should only have one permit', () => {
    const lock = new Lock();

    expect(lock.getPermits()).toEqual(1);
  });
});
