import assert from 'assert';
import path from 'path';
import {
  bundle,
  run,
  assertBundles,
  distDir,
  outputFS,
} from '@parcel/test-utils';

describe('sass', () => {
  test('should support requiring sass files', async () => {
    let b = await bundle(path.join(__dirname, '/integration/sass/index.js'));

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js'],
      },
      {
        name: 'index.css',
        assets: ['index.sass'],
      },
    ]);

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert.equal(output(), 2);

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');
    assert(css.includes('.index'));
  });

  test('should support requiring scss files', async () => {
    let b = await bundle(path.join(__dirname, '/integration/scss/index.js'));

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js'],
      },
      {
        name: 'index.css',
        assets: ['index.scss'],
      },
    ]);

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert.equal(output(), 2);

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');
    assert(css.includes('.index'));
  });

  test('should support scss imports', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/scss-import/index.js'),
    );

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js'],
      },
      {
        name: 'index.css',
        assets: ['index.scss'],
        includedFiles: {'index.cscc': ['bar.scss', 'foo.scss']},
      },
    ]);

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert.equal(output(), 2);

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');
    assert(css.includes('.index'));
    assert(css.includes('.foo'));
    assert(css.includes('.bar'));
  });

  test('should support requiring empty scss files', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/scss-empty/index.js'),
    );

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js'],
      },
      {
        name: 'index.css',
        assets: ['index.scss'],
      },
    ]);

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert.equal(output(), 2);

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');
    assert.equal(css.trim(), '/*# sourceMappingURL=index.css.map */');
  });

  test('should support linking to assets with url() from scss', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/scss-url/index.js'),
    );

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js'],
      },
      {
        type: 'jpeg',
        assets: ['image.jpeg'],
      },
      {
        name: 'index.css',
        assets: ['index.scss'],
        includedFiles: {'index.scss': ['package.json']},
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

  test('should support transforming scss with postcss', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/scss-postcss/index.js'),
    );

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js', 'index.module.scss'],
      },
      {
        name: 'index.css',
        assets: ['index.module.scss'],
      },
    ]);

    let output = await run(b);
    assert.equal(typeof output, 'function');
    let className = output();
    assert.notStrictEqual(className, 'index');

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');
    assert(css.includes(`.${className}`));
  });

  test('should support advanced import syntax', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/sass-advanced-import/index.sass'),
    );

    assertBundles(b, [
      {
        name: 'index.css',
        assets: ['index.sass'],
        includedFiles: {
          'index.sass': ['package.json', 'foo.sass', 'bar.sass'],
        },
      },
    ]);

    let css = (
      await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8')
    ).replace(/\s+/g, ' ');
    assert(css.includes('.foo { color: blue;'));
    assert(css.includes('.bar { color: green;'));
  });

  test('should support absolute imports', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/scss-absolute-imports/style.scss'),
    );

    assertBundles(b, [
      {
        name: 'style.css',
        assets: ['style.scss'],
        includedFiles: {'style.cscc': ['b.scss']},
      },
    ]);

    let css = await outputFS.readFile(path.join(distDir, 'style.css'), 'utf8');
    assert(css.includes('.a'));
    assert(css.includes('.b'));
  });

  test('should merge global data property from .sassrc.js', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/scss-global-data/index.scss'),
    );

    assertBundles(b, [
      {
        name: 'index.css',
        assets: ['index.scss'],
        includedFiles: {'index.scss': ['.sassrc.js', 'package.json']},
      },
    ]);

    let css = (
      await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8')
    ).replace(/\s+/g, ' ');
    assert(css.includes('.a { color: red;'));
  });

  test('should throw an exception when using webpack syntax', async () => {
    let didThrow = false;
    try {
      await bundle(
        path.join(
          __dirname,
          '/integration/sass-webpack-import-error/index.sass',
        ),
      );
    } catch (err) {
      assert.equal(
        err.diagnostics[0].message,
        `
The @import path "~library/style.sass" is using webpack specific syntax, which isn't supported by Parcel.

To @import files from node_modules, use "library/style.sass"
  ╷
1 │ @import "~library/style.sass"
  │         ^^^^^^^^^^^^^^^^^^^^^
  ╵
  test${path.sep}integration${path.sep}sass-webpack-import-error${path.sep}index.sass 1:9  root stylesheet`.trim(),
      );
      didThrow = true;
    }

    assert(didThrow);
  });

  test('should support node_modules imports', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/sass-node-modules-import/index.sass'),
    );

    assertBundles(b, [
      {
        name: 'index.css',
        assets: ['index.sass'],
        includedFiles: {'index.sass': ['package.json', 'style.sass']},
      },
    ]);

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');
    assert(css.includes('.external'));
  });

  test('should support imports from includePaths', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/sass-include-paths-import/index.sass'),
    );

    assertBundles(b, [
      {
        name: 'index.css',
        assets: ['index.sass'],
        includedFiles: {
          'index.sass': ['.sassrc.js', 'package.json', 'style.sass'],
        },
      },
    ]);

    let css = await outputFS.readFile(path.join(distDir, 'index.css'), 'utf8');
    assert(css.includes('.included'));
  });
});
