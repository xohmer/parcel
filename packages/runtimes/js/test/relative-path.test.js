// @flow

import assert from 'assert';
import {_dirname as dirname, _relative as relative} from '../src/relative-path';

describe('relative-path', () => {
  describe('dirname', () => {
    test('returns "." for a path without slashes', () => {
      assert.equal(dirname(''), '.');
      assert.equal(dirname('foo'), '.');
    });

    test('returns "." for a path with a single trailing slash', () => {
      assert.equal(dirname('foo/'), '.');
    });

    test('returns the directory for a relative path', () => {
      assert.equal(dirname('foo/bar/baz'), 'foo/bar');
    });

    test('returns the directory for a path with a trailing slash', () => {
      assert.equal(dirname('foo/bar/'), 'foo');
    });

    test('returns the directory for an absolute path', () => {
      assert.equal(dirname('/foo/bar/baz'), '/foo/bar');
    });
  });

  describe('relative', () => {
    test('returns "" when to and from are the same', () => {
      assert.equal(relative('foo/bar/baz', 'foo/bar/baz'), '');
    });

    test('returns a relative upward path when to contains from', () => {
      assert.equal(relative('foo/bar/baz', 'foo/bar'), '..');
      assert.equal(relative('foo/bar/baz', './foo/bar'), '..');
    });

    test('returns a relative upward path when they share a common root', () => {
      assert.equal(relative('foo/bar/baz', 'foo/bar/foobar'), '../foobar');
      assert.equal(
        relative('foo/bar/baz/foobaz', 'foo/bar/foobar'),
        '../../foobar',
      );
    });

    test('returns a relative forward path when from contains to', () => {
      assert.equal(relative('foo/bar', 'foo/bar/baz'), 'baz');
      assert.equal(relative('foo/bar', 'foo/bar/baz/foobar'), 'baz/foobar');
      assert.equal(relative('.', 'foo/bar'), 'foo/bar');
    });
  });
});
