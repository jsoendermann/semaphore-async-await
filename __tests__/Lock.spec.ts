import { Lock } from '../src';


describe('Lock', () => {
  it('should only have one permit', () => {
    const lock = new Lock();

    expect(lock.getPermits()).toEqual(1);
  });
});
