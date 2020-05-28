import assert from 'assert';
import path from 'path';
import {
  bundle,
  run,
  assertBundles,
  distDir,
  outputFS,
} from '@parcel/test-utils';

describe('less', () => {
  test('should support requiring less files', async () => {
    let b = await bundle(path.join(__dirname, '/integration/less/index.js'));

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js'],
      },
      {
        name: 'index.css',
        assets: ['index.less'],
      },
    ]);

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert.equal(output(), 2);

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');
    assert(css.includes('.index'));
  });

  test('should support less imports', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/less-import/index.js'),
    );

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js'],
      },
      {
        name: 'index.css',
        assets: ['index.less'],
      },
    ]);

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert.equal(output(), 2);

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');
    assert(css.includes('.a'));
    assert(css.includes('.b'));
    assert(css.includes('.c'));
    assert(css.includes('.d'));
  });

  test('should support advanced less imports', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/less-advanced-import/index.js'),
    );

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js'],
      },
      {
        name: 'index.css',
        assets: ['index.less'],
      },
    ]);

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert.equal(output(), 2);

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');

    assert(css.includes('.a'));
    assert(css.includes('.external-index'));
    assert(css.includes('.external-a'));
    assert(css.includes('.external-with-main'));
    assert(css.includes('.explicit-external-a'));
  });

  test('should support requiring empty less files', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/less-empty/index.js'),
    );

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js'],
      },
      {
        name: 'index.css',
        assets: ['index.less'],
      },
    ]);

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert.equal(output(), 2);

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');
    assert.equal(css.trim(), '/*# sourceMappingURL=index.css.map */');
  });

  test('should support linking to assets with url() from less', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/less-url/index.js'),
    );

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js'],
      },
      {
        name: 'index.css',
        assets: ['index.less'],
      },
      {
        type: 'woff2',
        assets: ['test.woff2'],
      },
    ]);

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert.equal(output(), 2);

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');
    assert(/url\("test\.[0-9a-f]+\.woff2"\)/.test(css));
    assert(css.includes('url("http://google.com")'));
    assert(css.includes('.index'));

    assert(
      await outputFS.exists(
        path.join(distDir, css.match(/url\("(test\.[0-9a-f]+\.woff2)"\)/)[1]),
      ),
    );
  });

  test('should support less url rewrites', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/less-url-rewrite/index.js'),
    );

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js'],
      },
      {
        name: 'index.css',
        assets: ['index.less'],
      },
      {
        type: 'woff2',
        assets: ['a.woff2'],
      },
      {
        type: 'woff2',
        assets: ['b.woff2'],
      },
    ]);

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert.equal(output(), 2);

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');
    assert(css.includes('.a'));
    assert(css.includes('.b'));
  });

  test('should support transforming less with postcss', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/less-postcss/index.js'),
    );

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js', 'index.module.less'],
      },
      {
        name: 'index.css',
        assets: ['index.module.less'],
      },
      {
        assets: ['img.svg'],
      },
    ]);

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert(output().startsWith('_index_'));

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');
    assert(css.includes('._index_'));
  });

  test('should throw an exception when using webpack syntax', async () => {
    let didThrow = false;

    try {
      await bundle(
        path.join(__dirname, '/integration/less-webpack-import-error/index.js'),
      );
    } catch (err) {
      assert.equal(
        err.diagnostics[0].message,
        'The @import path "~library/style.less" is using webpack specific syntax, which isn\'t supported by Parcel.\n\nTo @import files from node_modules, use "library/style.less"',
      );
      didThrow = true;
    }

    assert(didThrow);
  });

  test('should support configuring less include paths', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/less-include-paths/index.js'),
    );

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js'],
      },
      {
        name: 'index.css',
        assets: ['index.less'],
      },
    ]);

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert.equal(output(), 2);

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');
    assert(css.includes('.a'));
    assert(css.includes('.b'));
  });

  test('should ignore url() with IE behavior specifiers', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/less-url-behavior/index.less'),
    );

    assertBundles(b, [
      {
        name: 'index.css',
        assets: ['index.less'],
      },
    ]);

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');

    assert(css.includes('url(#default#VML)'));
  });
});
