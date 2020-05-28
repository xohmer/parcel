const assert = require('assert');
const isURL = require('../src/utils/is-url');

describe('isURL', () => {
  test('should match url', () => {
    assert(isURL('https://parceljs.org/'));
  });

  test('should match anchor', () => {
    assert(isURL('#'));
    assert(isURL('#foo'));
  });

  test('should match scheme-only', () => {
    assert(isURL('tel:'));
    assert(isURL('https:'));
    assert(isURL('mailto:'));
    assert(isURL('itms-apps:'));
  });
});
