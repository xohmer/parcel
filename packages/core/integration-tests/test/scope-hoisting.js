import assert from 'assert';
import path from 'path';
import {
  bundle as _bundle,
  bundler as _bundler,
  distDir,
  run,
  runBundle,
  outputFS,
  overlayFS,
  assertBundles,
  getNextBuild,
} from '@parcel/test-utils';

const bundle = (name, opts = {}) => _bundle(name, {scopeHoist: true, ...opts});

const bundler = (name, opts = {}) =>
  _bundler(name, {scopeHoist: true, ...opts});

describe('scope hoisting', function() {
  describe('es6', function() {
    it('supports default imports and exports of expressions', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/default-export-expression/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports default imports and exports of declarations', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/default-export-declaration/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports default imports and exports of anonymous declarations', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/default-export-anonymous/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports default imports and exports of variables', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/default-export-variable/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports named imports and exports of declarations', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/named-export-declaration/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports named imports and exports of variables', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/named-export-variable/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports renaming superclass identifiers', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/rename-superclass/a.js',
        ),
      );
      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports renaming imports', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/renamed-import/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports renaming exports', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/renamed-export/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports importing a namespace of exported values', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/import-namespace/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports namespace imports of excluded assets (node_modules)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/import-namespace-external/a.js',
        ),
      );

      let contents = await outputFS.readFile(
        b.getBundles()[0].filePath,
        'utf8',
      );

      assert(contents.includes('require("lodash")'));

      let match = contents.match(
        /\$parcel\$exportWildcard\((\$[a-f0-9]+\$exports), _lodash\);/,
      );
      assert(match);
      let [, id] = match;
      assert(contents.includes(`default = ${id}.add(10, 2);`));

      let output = await run(b);
      assert.deepEqual(output.default, 12);
    });

    it('supports namespace imports of theoretically excluded reexporting assets (sideEffects: false)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/import-namespace-sideEffects/index.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, {Main: 'main', a: 'foo', b: 'bar'});
    });

    it('supports re-exporting all exports from another module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-all/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 6);
    });

    it('supports re-exporting all exports from multiple modules', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-all-multiple/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 15);
    });

    it('can import from a different bundle via a re-export (1)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-bundle-boundary/index.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, ['operational', 'ui']);
    });

    it('can import from a different bundle via a re-export (sideEffects: false)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-bundle-boundary-side-effects/index.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, ['operational', 'ui']);
    });

    it('can import from a different bundle via a re-export (2)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-bundle-boundary2/index.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, ['foo', 'foo']);
    });

    it('can import from its own bundle with a split package', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-bundle-boundary3/index.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, [['a', 'b'], 'themed']);
    });

    it('supports importing all exports re-exported from multiple modules deep', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/import-multiple-wildcards/a.js',
        ),
      );

      let {foo, bar, baz, a, b: bb} = await run(b);
      assert.equal(foo + bar + baz + a + bb, 15);
    });

    it('supports re-exporting all exports from multiple modules deep', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-multiple/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 7);
    });

    it('supports re-exporting individual named exports from another module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-named/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 3);
    });

    it('supports re-exporting default exports from another module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-default/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 3);
    });

    it('supports re-exporting a namespace from another module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-namespace/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 6);
    });

    it('supports re-exporting a namespace from another module (chained)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-namespace-chained/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, {
        Bar: {
          A: 1,
          B: 2,
        },
        Foo: {
          A: 1,
          B: 2,
        },
      });
    });

    it('excludes default when re-exporting a module', async function() {
      let source = path.normalize(
        'integration/scope-hoisting/es6/re-export-exclude-default/a.js',
      );
      let message = `${path.normalize(
        'integration/scope-hoisting/es6/re-export-exclude-default/b.js',
      )} does not export 'default'`;
      await assert.rejects(() => bundle(path.join(__dirname, source)), {
        name: 'BuildError',
        message,
        diagnostics: [
          {
            message,
            origin: '@parcel/packager-js',
            filePath: source,
            language: 'js',
            codeFrame: {
              codeHighlights: {
                start: {
                  line: 1,
                  column: 8,
                },
                end: {
                  line: 1,
                  column: 8,
                },
              },
            },
          },
        ],
      });
    });

    it('throws when reexporting a missing symbol', async function() {
      let source = path.normalize(
        'integration/scope-hoisting/es6/re-export-missing/a.js',
      );
      let message = `${path.normalize(
        'integration/scope-hoisting/es6/re-export-missing/c.js',
      )} does not export 'foo'`;
      await assert.rejects(() => bundle(path.join(__dirname, source)), {
        name: 'BuildError',
        message,
        diagnostics: [
          {
            message,
            origin: '@parcel/packager-js',
            filePath: path.normalize(
              'integration/scope-hoisting/es6/re-export-missing/b.js',
            ),
            language: 'js',
            codeFrame: {
              codeHighlights: {
                start: {
                  line: 1,
                  column: 9,
                },
                end: {
                  line: 1,
                  column: 11,
                },
              },
            },
          },
        ],
      });
    });

    it('supports multiple exports of the same variable', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/multi-export/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 6);
    });

    it('supports live bindings of named exports', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/live-bindings/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 8);
    });

    it('supports dynamic import syntax for code splitting', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/dynamic-import/a.js',
        ),
      );

      assert.equal(await run(b), 5);
    });

    it('supports nested dynamic imports', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/dynamic-import-dynamic/a.js',
        ),
      );

      assert.equal(await run(b), 123);
    });

    it('supports named exports before the variable declaration', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/export-before-declaration/a.js',
        ),
      );

      assert.deepEqual(await run(b), {x: 2});
    });

    it('should not export function arguments', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/export-binding-identifiers/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, ['test']);
    });

    it('throws a meaningful error on undefined exports', async function() {
      let threw = false;
      try {
        await bundle(
          path.join(
            __dirname,
            '/integration/scope-hoisting/es6/export-undefined/a.js',
          ),
        );
      } catch (err) {
        threw = true;
        assert(
          err.diagnostics[0].message.includes(
            "Export 'Test' is not defined (1:8)",
          ),
        );
      }

      assert(threw);
    });

    it('supports import default CommonJS interop', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/import-commonjs-default/a.js',
        ),
      );

      let dist = await outputFS.readFile(b.getBundles()[0].filePath, 'utf8');
      assert.equal(
        dist.match(/var \$[a-z0-9]+\$\$interop\$default =/g).length,
        2,
      );

      let output = await run(b);
      assert.deepEqual(output, 'foobar:foo:bar');
    });

    it('does not export reassigned CommonJS exports references', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/commonjs-exports-reassign/a.js',
        ),
      );

      let dist = await outputFS.readFile(b.getBundles()[0].filePath, 'utf8');
      assert(/var \$[a-z0-9]+\$cjs_exports/.test(dist));

      let [foo, bExports] = await run(b);
      assert.equal(foo, 'foobar');
      assert.equal(typeof bExports, 'object');
    });

    it('supports import default CommonJS interop with dynamic imports', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/dynamic-default-interop/a.js',
        ),
      );

      assert.deepEqual(await run(b), 6);
    });

    it('supports exporting an import', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-var/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 'foobar');
    });

    it('supports importing from a wrapped asset', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-wrapped/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, ['a', true]);
    });

    it('supports importing from a wrapped asset with multiple bailouts', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-wrapped-bailout/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, ['b', true]);
    });

    it('supports requiring a re-exported and renamed ES6 import', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-renamed/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 'foobar');
    });

    it('supports simultaneous import and re-export of a symbol', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-import/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 4 * 123);
    });

    it('supports reexporting an asset from a shared bundle inside a shared bundle', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/shared-bundle-reexport/*.html',
        ),
      );

      assertBundles(b, [
        {
          type: 'html',
          assets: ['index1.html'],
        },
        {
          type: 'js',
          assets: ['index1.js'],
        },
        {
          type: 'html',
          assets: ['index2.html'],
        },
        {
          type: 'js',
          assets: ['index2.js'],
        },
        {
          type: 'html',
          assets: ['index3.html'],
        },
        {
          type: 'js',
          assets: ['index3.js'],
        },
        {
          type: 'js',
          assets: ['a.js'],
        },
        {
          type: 'js',
          assets: ['b.js'],
        },
      ]);

      for (let bundle of b.getBundles().filter(b => b.type === 'html')) {
        let calls = [];
        await runBundle(b, bundle, {
          call(v) {
            calls.push(v);
          },
        });
        assert.equal(calls.length, 1);
        assert(calls[0].startsWith('abcabc'));
      }
    });

    it('supports optimizing away an unused ES6 re-export', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/side-effects-re-exports/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 123);
    });

    it('should not optimize away an unused ES6 re-export and an used import', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/side-effects-re-exports-import/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 123);
    });

    it('should handle sideEffects: false with namespace imports and re-exports correctly', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/side-effects-re-exports-all/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 16);
    });

    it('correctly handles ES6 re-exports in library mode entries', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/side-effects-re-exports-library/a.js',
        ),
      );

      let contents = await outputFS.readFile(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/side-effects-re-exports-library/build.js',
        ),
        'utf8',
      );
      assert(!contents.includes('console.log'));

      let output = await run(b);
      assert.deepEqual(output, {c1: 'foo'});
    });

    it('correctly updates deferred assets that are reexported', async function() {
      let testDir = path.join(
        __dirname,
        '/integration/scope-hoisting/es6/side-effects-update-deferred-reexported',
      );

      let b = bundler(path.join(testDir, 'index.js'), {
        inputFS: overlayFS,
        outputFS: overlayFS,
      });

      let subscription = await b.watch();

      let bundleEvent = await getNextBuild(b);
      assert(bundleEvent.type === 'buildSuccess');
      let output = await run(bundleEvent.bundleGraph);
      assert.deepEqual(output, '12345hello');

      await overlayFS.mkdirp(path.join(testDir, 'node_modules', 'foo'));
      await overlayFS.copyFile(
        path.join(testDir, 'node_modules', 'foo', 'foo_updated.js'),
        path.join(testDir, 'node_modules', 'foo', 'foo.js'),
      );

      bundleEvent = await getNextBuild(b);
      assert(bundleEvent.type === 'buildSuccess');
      output = await run(bundleEvent.bundleGraph);
      assert.deepEqual(output, '1234556789');

      await subscription.unsubscribe();
    });

    it('correctly updates deferred assets that are reexported and imported directly', async function() {
      let testDir = path.join(
        __dirname,
        '/integration/scope-hoisting/es6/side-effects-update-deferred-direct',
      );

      let b = bundler(path.join(testDir, 'index.js'), {
        inputFS: overlayFS,
        outputFS: overlayFS,
      });

      let subscription = await b.watch();

      let bundleEvent = await getNextBuild(b);
      assert(bundleEvent.type === 'buildSuccess');
      let output = await run(bundleEvent.bundleGraph);
      assert.deepEqual(output, '12345hello');

      await overlayFS.mkdirp(path.join(testDir, 'node_modules', 'foo'));
      await overlayFS.copyFile(
        path.join(testDir, 'node_modules', 'foo', 'foo_updated.js'),
        path.join(testDir, 'node_modules', 'foo', 'foo.js'),
      );

      bundleEvent = await getNextBuild(b);
      assert(bundleEvent.type === 'buildSuccess');
      output = await run(bundleEvent.bundleGraph);
      assert.deepEqual(output, '1234556789');

      await subscription.unsubscribe();
    });

    it('removes deferred reexports when imported from multiple asssets', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/side-effects-re-exports-multiple/a.js',
        ),
      );

      let contents = await outputFS.readFile(
        b.getBundles()[0].filePath,
        'utf8',
      );

      assert(!contents.includes('$import$'));
      assert(contents.includes('= 1234;'));
      assert(!contents.includes('= 5678;'));

      let output = await run(b);
      assert.deepEqual(output, [1234, 1234]);
    });

    it('keeps side effects by default', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/side-effects/a.js',
        ),
      );

      let called = false;
      let output = await run(b, {
        sideEffect: () => {
          called = true;
        },
      });

      assert(called, 'side effect not called');
      assert.deepEqual(output, 4);
    });

    it('supports the package.json sideEffects: false flag', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/side-effects-false/a.js',
        ),
      );

      let called = false;
      let output = await run(b, {
        sideEffect: () => {
          called = true;
        },
      });

      assert(!called, 'side effect called');
      assert.deepEqual(output, 4);
    });

    it('concatenates in the correct order when re-exporting assets were excluded', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/side-effects-false-order/index.js',
        ),
      );

      let contents = await outputFS.readFile(
        b.getBundles()[0].filePath,
        'utf8',
      );
      assert(/\s+class\s+/.test(contents));

      let called = false;
      let output = await run(b, {
        sideEffect: () => {
          called = true;
        },
      });

      assert(!called, 'side effect called');
      assert.strictEqual(output[0], 'a');
      assert.strictEqual(output[1], 'b');
      assert(new output[3]() instanceof output[2]);
    });

    it('supports wildcards with sideEffects: false', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/side-effects-false-wildcards/a.js',
        ),
      );
      // let called = false;
      let output = await run(b, {
        sideEffect: () => {
          // called = true;
        },
      });

      // TODO (from PR #4385) - maybe comply to this once we have better symbol information?
      //assert(!called, 'side effect called');
      assert.deepEqual(output, 'bar');
    });

    it('correctly handles excluded and wrapped reexport assets with sideEffects: false', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/side-effects-false-wrap-excluded/a.js',
        ),
      );
      let output = await run(b);

      assert.deepEqual(output, 4);
    });

    it('supports the package.json sideEffects flag with an array', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/side-effects-array/a.js',
        ),
      );

      let calls = [];
      let output = await run(b, {
        sideEffect: caller => {
          calls.push(caller);
        },
      });

      assert(calls.toString() == 'foo', "side effect called for 'foo'");
      assert.deepEqual(output, 4);
    });

    it('supports the package.json sideEffects: false flag with shared dependencies', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/side-effects-false-duplicate/a.js',
        ),
      );

      let called = false;
      let output = await run(b, {
        sideEffect: () => {
          called = true;
        },
      });

      assert(!called, 'side effect called');
      assert.deepEqual(output, 6);
    });

    it('supports the package.json sideEffects: false flag with shared dependencies and code splitting', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/side-effects-split/a.js',
        ),
      );

      assert.deepEqual(await run(b), 581);
    });

    it('missing exports should be replaced with an empty object', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/empty-module/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, {b: {}});
    });

    it('supports importing a namespace from a commonjs module when code split', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/import-namespace-commonjs/a.js',
        ),
      );

      assert.deepEqual(await run(b), 4);
    });

    it('supports importing a namespace from a wrapped module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/import-namespace-wrapped/a.js',
        ),
      );

      let contents = await outputFS.readFile(
        b.getBundles()[0].filePath,
        'utf8',
      );
      assert(!contents.includes('$parcel$exportWildcard'));

      let output = await run(b);
      assert.deepEqual(await output, 1);
    });

    it('supports importing a namespace from a transpiled CommonJS module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/import-namespace-commonjs-transpiled/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(await output, {
        bar: 3,
        foo: 1,
      });
    });

    it('removes unused exports', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/tree-shaking/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 2);

      let contents = await outputFS.readFile(
        b.getBundles()[0].filePath,
        'utf8',
      );
      assert(contents.includes('foo'));
      assert(!contents.includes('bar'));
    });

    it('removes unused function exports when minified', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/tree-shaking-functions/a.js',
        ),
        {minify: true},
      );

      let output = await run(b);
      assert.deepEqual(output, 9);

      let contents = await outputFS.readFile(
        b.getBundles()[0].filePath,
        'utf8',
      );
      assert(/output=9/.test(contents));
      assert(!/.-./.test(contents));
    });

    it('removes unused transpiled classes using terser when minified', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/tree-shaking-classes-babel/a.js',
        ),
        {minify: true},
      );

      let output = await run(b);
      assert.deepEqual(output, 3);

      let contents = await outputFS.readFile(
        b.getBundles()[0].filePath,
        'utf8',
      );
      assert(!contents.includes('method'));
    });

    it('keeps member expression with computed properties that are variables', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/tree-shaking-export-computed-prop/a.js',
        ),
        {minify: true},
      );

      let output = await run(b);
      assert.strictEqual(output[0], true);
      assert.strictEqual(typeof output[1], 'undefined');
      assert.strictEqual(output[2], true);
      assert.strictEqual(typeof output[3], 'undefined');
    });

    it('removes functions that increment variables in object properties', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/tree-shaking-increment-object/a.js',
        ),
        {minify: true},
      );

      let content = await outputFS.readFile(b.getBundles()[0].filePath, 'utf8');
      assert(!content.includes('++'));

      await run(b);
    });

    it('support exporting a ES6 module exported as CommonJS', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-commonjs/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 'foo');
    });

    it('support chained namespace reexports of CommonJS', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/re-export-commonjs-wildcard/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 'foo');
    });

    it('should support named imports on wrapped modules', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/import-wrapped/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 'bar');
    });

    it('should insert esModule flag for interop for async (or shared) bundles', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/interop-async/index.html',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, ['client', 'client', 'viewer']);
    });

    it('should support the jsx pragma', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/scope-hoisting/es6/jsx-pragma/a.js'),
      );

      let output = await run(b);
      assert.deepEqual(output, {
        children: 'Test',
        props: null,
        type: 'span',
      });
    });

    it('should not nameclash with internal variables', async function() {
      let b = await bundle(
        path.join(__dirname, '/integration/scope-hoisting/es6/name-clash/a.js'),
      );

      let output = await run(b);
      assert.deepEqual(output, 'bar');
    });

    it('should shake pure property assignments', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/pure-assignment/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 2);

      let contents = await outputFS.readFile(
        b.getBundles()[0].filePath,
        'utf8',
      );
      assert(!contents.includes('exports.bar ='));
    });

    it('should correctly rename references to default exported classes', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/default-export-class-rename/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output.foo, 'bar');
    });

    it('should correctly rename references to a class in the class body', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/class-selfreference/a.js',
        ),
      );
      let output = await run(b);
      assert.deepEqual(output.foo, 'bar');
    });

    it('does not tree-shake assignments to unknown objects', async () => {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/tree-shaking-no-unknown-objects/index.js',
        ),
      );

      assert.equal(await run(b), 42);
    });

    it('can conditionally reference an imported symbol and unconditionally reference it', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/conditional-import-reference/index.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 'hello');
    });

    it('can conditionally reference an imported symbol from another bundle in a case clause', async () => {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/es6/async-interop-conditional/index.js',
        ),
      );

      let output = await run(b);
      assert.equal(await output, 42);
    });
  });

  describe('commonjs', function() {
    it('supports require of commonjs modules', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('concats commonjs modules in the correct order', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/concat-order/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports default imports of commonjs modules', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/default-import/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('concats modules with inserted globals in the correct order', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/concat-order-globals/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 'foobar');
    });

    it('supports named imports of commonjs modules', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/named-import/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports namespace imports of commonjs modules', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/import-namespace/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports require of es6 default export of expressions', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-default-export-expression/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports require of es6 default export of declarations', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-default-export-declaration/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports require of es6 default export of variables', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-default-export-variable/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports require of es6 named export of declarations', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-named-export-declaration/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports require of es6 named export of variables', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-named-export-variable/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports require of es6 renamed exports', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-renamed-export/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('supports require of es6 module re-exporting all exports from another module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-re-export-all/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 6);
    });

    it('supports require of es6 module re-exporting all exports from multiple modules', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-re-export-multiple/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 7);
    });

    it('supports re-exporting individual named exports from another module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-re-export-named/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 3);
    });

    it('supports re-exporting default exports from another module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-re-export-default/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 3);
    });

    it('supports re-exporting a namespace from another module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-re-export-namespace/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 6);
    });

    it('excludes default when re-exporting a module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-re-export-exclude-default/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, {foo: 3});
    });

    it('supports hybrid ES6 + commonjs modules', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/es6-commonjs-hybrid/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 5);
    });

    it('inserts commonjs exports object in the right place', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/export-order/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 5);
    });

    it('bails out exports access resolving if it is accessed freely (exports assign)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/exports-access-bailout/exports-assign.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 5);
    });

    it('bails out exports access resolving if it is accessed freely (exports define)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/exports-access-bailout/exports-define.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 5);
    });

    it('bails out exports access resolving if it is accessed freely (module.exports assign)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/exports-access-bailout/module-exports-assign.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 5);
    });

    it('bails out exports access resolving if it is accessed freely (module.exports define)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/exports-access-bailout/module-exports-define.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 5);
    });

    it('bails out imported exports access resolving if it is accessed freely (exports assign)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/exports-access-bailout/exports-assign-entry.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 5);
    });

    it('bails out imported exports access resolving if it is accessed freely (exports define)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/exports-access-bailout/exports-define-entry.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 5);
    });

    it('bails out imported exports access resolving if it is accessed freely (module.exports assign)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/exports-access-bailout/module-exports-assign-entry.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 5);
    });

    it('bails out imported exports access resolving if it is accessed freely (module.exports define)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/exports-access-bailout/module-exports-define-entry.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 5);
    });

    it('bails out imported exports access resolving if it is accessed freely (exports reexport)', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/exports-access-bailout/exports-assign-reexport-entry.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, [5, 5]);
    });

    it('builds commonjs modules that assigns to exports before module.exports', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/exports-before-module-exports/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 42);
    });

    it('builds commonjs modules that assigns to module.exports before exports', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/module-exports-before-exports/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 42);
    });

    it("doesn't insert parcelRequire for missing non-js assets", async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/missing-non-js/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 27);
    });

    it('define exports in the outermost scope', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/define-exports/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 'bar');
    });

    it('supports live bindings of named exports', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/live-bindings/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 8);
    });

    it('should wrap modules that use eval in a function', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/wrap-eval/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 4);
    });

    it('should wrap modules that have a top-level return', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/wrap-return/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 2);
    });

    it('should hoist all vars in the scope', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/wrap-var-hoisting/a.js',
        ),
      );

      let contents = await outputFS.readFile(
        b.getBundles()[0].filePath,
        'utf8',
      );

      assert(contents.split('f1_var').length - 1, 1);
      assert(contents.split('f2_var').length - 1, 1);
      assert(contents.split('f3_var').length - 1, 1);
      assert(contents.split('f4_var').length - 1, 1);
      assert(contents.split('c1_var').length - 1, 1);
      assert(contents.split('c2_var').length - 1, 1);
      assert(contents.split('BigIntSupported').length - 1, 4);
      assert(contents.split('inner_let').length - 1, 2);

      let output = await run(b);
      assert.equal(output, true);
    });

    it('should wrap modules that access `module` as a free variable', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/wrap-module/a.js',
        ),
      );

      assert.deepEqual(await run(b), {exports: {foo: 2}});
    });

    it('should call init for wrapped modules when codesplitting', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/wrap-module-codesplit/a.js',
        ),
      );

      assert.deepEqual(await run(b), 2);
    });

    it('should wrap modules that non-statically access `module`', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/wrap-module-computed/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, {foo: 2});
    });

    it('should not rename function local variables according to global replacements', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/keep-local-function-var/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 'foo');
    });

    it('supports using this in arrow functions', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/this-arrow-function/a.js',
        ),
      );

      let content = await outputFS.readFile(b.getBundles()[0].filePath, 'utf8');
      assert(content.includes('=>'));

      let output = await run(b);
      assert.strictEqual(output, 'Say other');
    });

    it('supports assigning to this as exports object', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/this-reference/a.js',
        ),
      );

      let output = await run(b);
      assert.strictEqual(output, 2);
    });

    it('supports assigning to this as exports object in wrapped module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/this-reference-wrapped/a.js',
        ),
      );

      let output = await run(b);
      assert.strictEqual(output, 6);
    });

    it('support url imports in wrapped modules with interop', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/wrap-interop-url-import/a.js',
        ),
      );

      assertBundles(b, [
        {
          type: 'js',
          assets: [
            'a.js',
            'b.js',
            'bundle-manifest.js',
            'bundle-url.js',
            'JSRuntime.js',
            'JSRuntime.js',
            'relative-path.js',
          ],
        },
        {
          type: 'txt',
          assets: ['data.txt'],
        },
      ]);

      let output = await run(b);
      assert(output.endsWith('.txt'));
    });

    it('supports module object properties', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/module-object/a.js',
        ),
      );

      let entryBundle;
      b.traverseBundles((bundle, ctx, traversal) => {
        if (bundle.isEntry) {
          entryBundle = bundle;
          traversal.stop();
        }
      });
      let entryAsset = entryBundle.getMainEntry();

      // TODO: this test doesn't currently work in older browsers since babel
      // replaces the typeof calls before we can get to them.
      let output = await run(b);
      assert.equal(output.id, entryAsset.id);
      assert.equal(output.hot, null);
      assert.equal(output.moduleRequire, null);
      assert.equal(output.type, 'object');
      assert.deepEqual(output.exports, {});
      assert.equal(output.exportsType, 'object');
      assert.equal(output.require, 'function');
    });

    it("doesn't support require.resolve calls for included assets", async function() {
      let message =
        "`require.resolve` calls for bundled modules or bundled assets aren't supported with scope hoisting";
      let source = path.join(
        __dirname,
        '/integration/scope-hoisting/commonjs/require-resolve/a.js',
      );
      await assert.rejects(() => bundle(source), {
        name: 'BuildError',
        message,
        diagnostics: [
          {
            message,
            origin: '@parcel/packager-js',
            filePath: source,
            language: 'js',
            codeFrame: {
              codeHighlights: {
                start: {
                  line: 3,
                  column: 10,
                },
                end: {
                  line: 3,
                  column: 31,
                },
              },
            },
          },
        ],
      });
    });

    it('supports mutations of the exports object by the importer', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/mutated-exports-object-importer/index.js',
        ),
      );

      assert.deepEqual(await run(b), [43, {foo: 43}]);
    });

    it('supports mutations of the exports object by a different asset', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/mutated-exports-object-different/index.js',
        ),
      );

      let contents = await outputFS.readFile(
        b.getBundles()[0].filePath,
        'utf8',
      );
      assert(!contents.includes('$exports'));
      assert.equal(await run(b), 43);
    });

    it('supports mutations of the exports object inside an expression', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/mutated-exports-object-expression/index.js',
        ),
      );

      assert.deepEqual(await run(b), [{foo: 3}, 3, 3]);
    });

    it('supports require.resolve calls for excluded modules', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-resolve-excluded/a.js',
        ),
      );

      let output = await run(b, {
        require: {
          resolve: () => 'my-resolved-fs',
        },
      });
      assert.deepEqual(output, 'my-resolved-fs');
    });

    it('supports requiring a re-exported ES6 import', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/re-export-var/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 'foobar');
    });

    it('supports object pattern requires', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/object-pattern/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 5);
    });

    it('eliminates CommonJS export object where possible', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/eliminate-exports/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 6);
    });

    it('supports multiple assignments in one line', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/multi-assign/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, {foo: 2, bar: 2, baz: 2});
    });

    it('supports circular dependencies', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-circular/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 'foo bar');
    });

    it('executes modules in the correct order', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-execution-order/a.js',
        ),
      );

      let out = [];
      await run(b, {
        output(o) {
          out.push(o);
        },
      });

      assert.deepEqual(out, ['a', 'b', 'c', 'd']);
    });

    it('supports conditional requires', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-conditional/a.js',
        ),
      );

      let out = [];
      await run(b, {
        b: false,
        output(o) {
          out.push(o);
        },
      });

      assert.deepEqual(out, ['a', 'd']);

      out = [];
      await run(b, {
        b: true,
        output(o) {
          out.push(o);
        },
      });

      assert.deepEqual(out, ['a', 'b', 'c', 'd']);
    });

    it('supports requires inside functions', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-in-function/a.js',
        ),
      );

      let out = [];
      await run(b, {
        output(o) {
          out.push(o);
        },
      });

      assert.deepEqual(out, ['a', 'c', 'b']);
    });

    it('supports requires inside functions with es6 import side effects', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-in-function-import/a.js',
        ),
      );

      let out = [];
      await run(b, {
        output(o) {
          out.push(o);
        },
      });

      assert.deepEqual(out, ['a', 'd', 'c', 'b']);
    });

    it('hoists import calls to the top', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-in-function-import-hoist/a.js',
        ),
      );

      let out = [];
      await run(b, {
        output(o) {
          out.push(o);
        },
      });

      assert.deepEqual(out, ['a', 'd', 'c', 'b']);
    });

    it('supports requires inside functions with es6 re-export side effects', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/require-in-function-reexport/a.js',
        ),
      );

      let out = [];
      await run(b, {
        output(o) {
          out.push(o);
        },
      });

      assert.deepEqual(out, ['a', 'd', 'c', 'b']);
    });

    it('can bundle the node stream module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/stream-module/a.js',
        ),
      );

      let res = await run(b);
      assert.equal(typeof res.Readable, 'function');
      assert.equal(typeof res.Writable, 'function');
      assert.equal(typeof res.Duplex, 'function');
    });

    it('missing exports should be replaced with an empty object', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/empty-module/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, {b: {}});
    });

    it('removes unused exports', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/tree-shaking/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 2);

      let contents = await outputFS.readFile(
        b.getBundles()[0].filePath,
        'utf8',
      );
      assert(contents.includes('foo'));
      assert(!contents.includes('bar'));
    });

    it('supports removing an unused inline export with uglify minification', async function() {
      // Uglify does strange things to multiple assignments in a line.
      // See https://github.com/parcel-bundler/parcel/issues/1549
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/export-local/a.js',
        ),
        {minify: true},
      );

      let output = await run(b);
      assert.deepEqual(output, 3);
    });

    it('should support sideEffects: false', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/side-effects-false/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 9);
    });

    it('should support two aliases to the same module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/wrap-aliases/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 42);
    });

    it('should support optional requires', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/wrap-optional/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 42);
    });

    it('should insert __esModule interop flag when importing from an ES module', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/interop-require-es-module/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output.__esModule, true);
      assert.equal(output.default, 2);
    });

    it('should export the same values for interop shared modules in main and child bundle', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/interop-require-es-module-code-split/main.js',
        ),
      );

      assert.equal(await run(b), 'bar:bar');
    });

    it('should export the same values for interop shared modules in main and child bundle if shared bundle is deep nested', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/interop-require-es-module-code-split-intermediate/main.js',
        ),
      );

      assert.equal(await run(b), 'bar:bar');
    });

    it('should support assigning to exports from inside a function', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/export-assign-scope/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, 2);
    });

    it('should also hoist inserted polyfills of globals', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/globals-polyfills/a.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, true);
    });

    it('should support wrapping array destructuring declarations', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/wrap-destructuring-array/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, [1, 2]);
    });

    it('should support wrapping object destructuring declarations', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/wrap-destructuring-object/a.js',
        ),
      );

      let output = await run(b);
      assert.deepEqual(output, [4, 2]);
    });

    it('does not tree-shake assignments to unknown objects', async () => {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/tree-shaking-no-unknown-objects/index.js',
        ),
      );

      assert.equal(await run(b), 42);
    });

    it('can conditionally reference an imported symbol and unconditionally reference it', async function() {
      let b = await bundle(
        path.join(
          __dirname,
          '/integration/scope-hoisting/commonjs/conditional-import-reference/index.js',
        ),
      );

      let output = await run(b);
      assert.equal(output, 'hello');
    });
  });

  it('should not throw with JS included from HTML', async function() {
    let b = await bundle(
      path.join(__dirname, '/integration/html-js/index.html'),
    );

    assertBundles(b, [
      {
        name: 'index.html',
        assets: ['index.html'],
      },
      {
        type: 'js',
        assets: ['index.js'],
      },
    ]);

    let value = null;
    await run(b, {
      alert: v => (value = v),
    });
    assert.equal(value, 'Hi');
  });

  it('should not throw with JS dynamic imports included from HTML', async function() {
    let b = await bundle(
      path.join(__dirname, '/integration/html-js-dynamic/index.html'),
    );

    assertBundles(b, [
      {
        name: 'index.html',
        assets: ['index.html'],
      },
      {
        type: 'js',
        assets: [
          'bundle-url.js',
          'cacheLoader.js',
          'index.js',
          'js-loader.js',
          'JSRuntime.js',
          'bundle-manifest.js',
          'JSRuntime.js',
          'relative-path.js',
        ],
      },
      {
        type: 'js',
        assets: ['local.js'],
      },
    ]);

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert.equal(await output(), 'Imported: foobar');
  });

  it('should include the prelude in shared entry bundles', async function() {
    let b = await bundle(
      path.join(__dirname, '/integration/html-shared/index.html'),
    );

    assertBundles(b, [
      {
        name: 'index.html',
        assets: ['index.html'],
      },
      {
        type: 'js',
        assets: ['index.js'],
      },
      {
        name: 'iframe.html',
        assets: ['iframe.html'],
      },
      {
        type: 'js',
        assets: ['iframe.js'],
      },
      {
        type: 'js',
        assets: ['lodash.js'],
      },
    ]);

    let sharedBundle = b
      .getBundles()
      .sort((a, b) => b.stats.size - a.stats.size)[0];
    let contents = await outputFS.readFile(sharedBundle.filePath, 'utf8');
    assert(contents.includes(`parcelRequire =`));
  });

  it('does not include prelude if child bundles are isolated', async function() {
    let b = await bundle(
      path.join(__dirname, '/integration/worker-shared/index.js'),
    );

    let mainBundle = b.getBundles().find(b => b.name === 'index.js');
    let contents = await outputFS.readFile(mainBundle.filePath, 'utf8');
    assert(!contents.includes(`parcelRequire =`));
  });

  it('should include prelude in shared worker bundles', async function() {
    let b = await bundle(
      path.join(__dirname, '/integration/worker-shared/index.js'),
    );

    let sharedBundle = b
      .getBundles()
      .sort((a, b) => b.stats.size - a.stats.size)
      .find(b => b.name !== 'index.js');
    let contents = await outputFS.readFile(sharedBundle.filePath, 'utf8');
    assert(contents.includes(`parcelRequire =`));

    let workerBundle = b.getBundles().find(b => b.name.startsWith('worker-b'));
    contents = await outputFS.readFile(workerBundle.filePath, 'utf8');
    assert(contents.includes(`importScripts("./${sharedBundle.name}")`));
  });

  // Mirrors the equivalent test in javascript.js
  it('should insert global variables when needed', async function() {
    let b = await bundle(
      path.join(__dirname, '/integration/globals/scope-hoisting.js'),
    );

    let output = await run(b);
    assert.deepEqual(output(), {
      dir: path.join(__dirname, '/integration/globals'),
      file: path.join(__dirname, '/integration/globals/index.js'),
      buf: Buffer.from('browser').toString('base64'),
      global: true,
    });
  });

  it('should be able to named import a reexported namespace in an async bundle', async function() {
    let b = await bundle(
      path.join(
        __dirname,
        '/integration/scope-hoisting/es6/async-named-import-ns-reexport/index.js',
      ),
    );

    assert.deepEqual(await run(b), [42, 42, 42, 42]);
  });

  it('should not remove a binding with a used AssignmentExpression', async function() {
    let b = await bundle(
      path.join(
        __dirname,
        '/integration/scope-hoisting/es6/used-assignmentexpression/a.js',
      ),
    );

    assert.strictEqual(await run(b), 3);
  });

  it('should wrap imports inside arrow functions', async function() {
    let b = await bundle(
      path.join(
        __dirname,
        '/integration/scope-hoisting/es6/wrap-import-arrowfunction/a.js',
      ),
    );

    let contents = await outputFS.readFile(
      b.getBundles().find(bundle => bundle.isEntry).filePath,
      'utf8',
    );
    assert(contents.includes('=>'));

    let calls = [];
    let output = await run(b, {
      sideEffect(id) {
        calls.push(id);
      },
    });
    assert.deepEqual(calls, []);
    assert.equal(typeof output, 'function');
    assert.deepEqual(await output(), {default: 1234});
    assert.deepEqual(calls, ['async']);
  });

  it('can static import and dynamic import in the same bundle without creating a new bundle', async () => {
    let b = await bundle(
      path.join(
        __dirname,
        '/integration/sync-async/same-bundle-scope-hoisting.js',
      ),
    );

    assertBundles(b, [
      {
        name: 'same-bundle-scope-hoisting.js',
        assets: [
          'same-bundle-scope-hoisting.js',
          'get-dep.js',
          'get-dep-2.js',
          'dep.js',
          'JSRuntime.js',
        ],
      },
    ]);

    assert.deepEqual(await await run(b), [42, 42, 42]);
  });

  it('can static import and dynamic import in the same bundle ancestry without creating a new bundle', async () => {
    let b = await bundle(
      path.join(
        __dirname,
        '/integration/sync-async/same-ancestry-scope-hoisting.js',
      ),
    );

    assertBundles(b, [
      {
        name: 'same-ancestry-scope-hoisting.js',
        assets: [
          'bundle-manifest.js',
          'bundle-url.js',
          'cacheLoader.js',
          'dep.js',
          'js-loader.js',
          'JSRuntime.js',
          'JSRuntime.js',
          'relative-path.js',
          'same-ancestry-scope-hoisting.js',
        ],
      },
      {
        assets: ['get-dep.js', 'JSRuntime.js'],
      },
    ]);

    assert.deepEqual(await run(b), [42, 42]);
  });

  it('can static import and dynamic import in the same bundle when another bundle requires async', async () => {
    let b = await bundle(
      [
        'same-bundle-scope-hoisting.js',
        'get-dep-scope-hoisting.js',
      ].map(entry => path.join(__dirname, '/integration/sync-async/', entry)),
    );

    assertBundles(b, [
      {
        assets: ['dep.js'],
      },
      {
        name: 'same-bundle-scope-hoisting.js',
        assets: [
          'same-bundle-scope-hoisting.js',
          'get-dep.js',
          'get-dep-2.js',
          'dep.js',
          'JSRuntime.js',
        ],
      },
      {
        name: 'get-dep-scope-hoisting.js',
        assets: [
          'bundle-manifest.js',
          'bundle-url.js',
          'cacheLoader.js',
          'get-dep-scope-hoisting.js',
          'js-loader.js',
          'JSRuntime.js',
          'JSRuntime.js',
          'relative-path.js',
        ],
      },
    ]);

    let bundles = b.getBundles();
    let sameBundle = bundles.find(
      b => b.name === 'same-bundle-scope-hoisting.js',
    );
    let getDep = bundles.find(b => b.name === 'get-dep-scope-hoisting.js');

    assert.deepEqual(await runBundle(b, sameBundle), [42, 42, 42]);
    assert.deepEqual(await runBundle(b, getDep), 42);
  });

  it("can share dependencies between a shared bundle and its sibling's descendants", async () => {
    let b = await bundle(
      path.join(
        __dirname,
        '/integration/shared-exports-for-sibling-descendant/scope-hoisting.js',
      ),
    );

    assertBundles(b, [
      {
        assets: ['wraps.js', 'lodash.js'],
      },
      {
        assets: ['a.js', 'JSRuntime.js'],
      },
      {
        assets: ['child.js', 'JSRuntime.js'],
      },
      {
        assets: ['grandchild.js'],
      },
      {
        assets: ['b.js'],
      },
      {
        name: 'scope-hoisting.js',
        assets: [
          'bundle-manifest.js',
          'bundle-url.js',
          'cacheLoader.js',
          'scope-hoisting.js',
          'js-loader.js',
          'JSRuntime.js',
          'JSRuntime.js',
          'JSRuntime.js',
          'relative-path.js',
        ],
      },
    ]);

    assert.deepEqual(await run(b), [3, 5]);
  });

  it('deduplicates shared sibling assets between bundle groups', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/shared-sibling-scope-hoist/index.js'),
    );

    assert.deepEqual(await run(b), ['a', 'b', 'c']);
  });

  it('can run an entry bundle whose entry asset is present in another bundle', async () => {
    let b = await bundle(
      ['index.js', 'value.js'].map(basename =>
        path.join(__dirname, '/integration/sync-entry-shared', basename),
      ),
      {targets: {main: {context: 'node', distDir}}},
    );

    assertBundles(b, [
      {
        name: 'index.js',
        assets: ['index.js', 'JSRuntime.js'],
      },
      {name: 'value.js', assets: ['value.js']},
      {assets: ['async.js']},
    ]);

    assert.equal(await (await run(b)).default, 43);
  });

  it('can run an async bundle whose entry asset is present in another bundle', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/async-entry-shared/scope-hoisting.js'),
    );

    assertBundles(b, [
      {
        name: 'scope-hoisting.js',
        assets: [
          'scope-hoisting.js',
          'bundle-manifest.js',
          'bundle-url.js',
          'cacheLoader.js',
          'js-loader.js',
          'JSRuntime.js',
          'JSRuntime.js',
          'JSRuntime.js',
          'relative-path.js',
        ],
      },
      {assets: ['value.js']},
      {assets: ['async.js']},
    ]);

    assert.deepEqual(await run(b), [42, 43]);
  });

  it('can run an async bundle that depends on a nonentry asset in a sibling', async () => {
    let b = await bundle(
      ['scope-hoisting.js', 'other-entry.js'].map(basename =>
        path.join(
          __dirname,
          '/integration/async-entry-shared-sibling',
          basename,
        ),
      ),
    );

    assertBundles(b, [
      {
        name: 'scope-hoisting.js',
        assets: [
          'scope-hoisting.js',
          'bundle-manifest.js',
          'bundle-url.js',
          'cacheLoader.js',
          'js-loader.js',
          'JSRuntime.js',
          'JSRuntime.js',
          'relative-path.js',
        ],
      },
      {
        name: 'other-entry.js',
        assets: [
          'other-entry.js',
          'bundle-manifest.js',
          'bundle-url.js',
          'cacheLoader.js',
          'js-loader.js',
          'JSRuntime.js',
          'JSRuntime.js',
          'relative-path.js',
        ],
      },
      {assets: ['a.js', 'value.js']},
      {assets: ['b.js']},
    ]);

    assert.deepEqual(await run(b), 43);
  });

  it('correctly updates dependency when a specified is added', async function() {
    let testDir = path.join(
      __dirname,
      '/integration/scope-hoisting/es6/cache-add-specifier',
    );

    let b = bundler(path.join(testDir, 'a.js'), {
      inputFS: overlayFS,
      outputFS: overlayFS,
    });

    let subscription = await b.watch();

    let bundleEvent = await getNextBuild(b);
    assert(bundleEvent.type === 'buildSuccess');
    let output = await run(bundleEvent.bundleGraph);
    assert.deepEqual(output, 'foo');

    await overlayFS.mkdirp(testDir);
    await overlayFS.copyFile(
      path.join(testDir, 'a.1.js'),
      path.join(testDir, 'a.js'),
    );

    bundleEvent = await getNextBuild(b);
    assert(bundleEvent.type === 'buildSuccess');
    output = await run(bundleEvent.bundleGraph);
    assert.deepEqual(output, 'foobar');

    await subscription.unsubscribe();
  });
});
