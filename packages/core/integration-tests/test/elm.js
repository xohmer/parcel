import assert from 'assert';
import {bundle, assertBundleTree, run, outputFS} from '@parcel/test-utils';

describe.skip('elm', function() {
  test('should produce a basic Elm bundle', async () => {
    let b = await bundle(__dirname + '/integration/elm/index.js');

    await assertBundleTree(b, {
      type: 'js',
      assets: ['Main.elm', 'index.js'],
    });

    let output = await run(b);
    assert.equal(typeof output().Elm.Main.init, 'function');
  });
  test('should produce a elm bundle with debugger', async () => {
    let b = await bundle(__dirname + '/integration/elm/index.js');

    await run(b);
    let js = await outputFS.readFile(__dirname + '/dist/index.js', 'utf8');
    assert(js.includes('elm$browser$Debugger'));
  });

  test('should apply elm-hot if HMR is enabled', async () => {
    let b = await bundle(__dirname + '/integration/elm/index.js', {
      hmr: true,
    });

    await assertBundleTree(b, {
      type: 'js',
      assets: ['Main.elm', 'hmr-runtime.js', 'index.js'],
    });

    let js = await outputFS.readFile(__dirname + '/dist/index.js', 'utf8');
    assert(js.includes('[elm-hot]'));
  });

  test('should remove debugger in production', async () => {
    let b = await bundle(__dirname + '/integration/elm/index.js', {
      production: true,
    });

    await run(b);
    let js = await outputFS.readFile(__dirname + '/dist/index.js', 'utf8');
    assert(!js.includes('elm$browser$Debugger'));
  });

  test('should minify Elm in production mode', async () => {
    let b = await bundle(__dirname + '/integration/elm/index.js', {
      production: true,
    });

    let output = await run(b);
    assert.equal(typeof output().Elm.Main.init, 'function');

    let js = await outputFS.readFile(__dirname + '/dist/index.js', 'utf8');
    assert(!js.includes('elm$core'));
  });
});
