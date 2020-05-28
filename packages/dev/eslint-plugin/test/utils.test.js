'use strict';

const assert = require('assert');
const path = require('path');
const {parse} = require('babel-eslint');
const readPkgUp = require('read-pkg-up');

const {
  isStaticRequire,
  isStaticResolve,
  relativePathForRequire,
} = require('../src/utils');

const pkgInfo = readPkgUp.sync({cwd: __dirname});
const pkgPath = pkgInfo.path;
const pkgName = pkgInfo.pkg.name;

describe('utils', () => {
  describe('isRequire', () => {
    test('identifies requires', () => {
      assert.equal(
        isStaticRequire(getFirstExpression(parse("require('@parcel/core')"))),
        true,
      );
    });

    test("doesn't handle dynamic requires", () => {
      assert.equal(
        isStaticRequire(getFirstExpression(parse('require(dynamic)'))),
        false,
      );
    });
  });

  describe('isResolve', () => {
    test('identifies built-in require.resolve', () => {
      assert.equal(
        isStaticResolve(
          getFirstExpression(parse("require.resolve('@parcel/core')")),
        ),
        true,
      );
    });
  });

  describe('relativePathForRequire', () => {
    test('behaves identically as path.relative on unix', () => {
      let sep = path.sep;
      path.sep = '/';
      assert.equal(
        relativePathForRequire({
          origin: __filename,
          request: '@parcel/eslint-plugin/',
          pkgName,
          pkgPath,
        }),
        '../',
      );
      path.sep = sep;
    });

    test('uses / to separate paths even when path.sep is not /', () => {
      let sep = path.sep;
      path.sep = '\\';
      assert.equal(
        relativePathForRequire({
          origin: __filename,
          request: '@parcel/eslint-plugin/',
          pkgName,
          pkgPath,
        }),
        '../',
      );
      path.sep = sep;
    });

    test('leaves absolute paths alone', () => {
      assert.equal(
        relativePathForRequire({
          origin: __filename,
          request: '/a/b',
          pkgName,
          pkgPath,
        }),
        '/a/b',
      );
    });

    test('prepends ./ to peer paths', () => {
      assert.equal(
        relativePathForRequire({
          origin: __filename,
          request: '@parcel/eslint-plugin/test/baz',
          pkgName,
          pkgPath,
        }),
        './baz',
      );
    });
  });
});

function getFirstExpression(program) {
  return program.body[0].expression;
}
