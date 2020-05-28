import assert from 'assert';
import path from 'path';
import {bundle, assertBundles, outputFS, inputFS} from '@parcel/test-utils';

describe('typescript types', () => {
  test('should generate a typescript declaration file', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/ts-types/main/index.ts'),
    );

    assertBundles(b, [
      {
        type: 'js',
        assets: ['index.ts'],
      },
      {
        type: 'ts',
        assets: ['index.ts'],
      },
    ]);

    let dist = (
      await outputFS.readFile(
        path.join(__dirname, '/integration/ts-types/main/dist/types.d.ts'),
        'utf8',
      )
    ).replace(/\r\n/g, '\n');
    let expected = await inputFS.readFile(
      path.join(__dirname, '/integration/ts-types/main/expected.d.ts'),
      'utf8',
    );
    assert.equal(dist, expected);
  });

  test('should generate ts declarations with imports', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/ts-types/importing/index.ts'),
    );

    assertBundles(b, [
      {
        type: 'js',
        assets: ['index.ts', 'file.ts', 'namespace.ts'],
      },
      {
        type: 'ts',
        assets: ['index.ts'],
        includedFiles: {
          'index.ts': [
            'other.ts',
            'file.ts',
            'namespace.ts',
            'lib.d.ts',
            'lib.dom.d.ts',
            'lib.es5.d.ts',
            'lib.scripthost.d.ts',
            'lib.webworker.importscripts.d.ts',
          ],
        },
      },
    ]);

    let dist = (
      await outputFS.readFile(
        path.join(__dirname, '/integration/ts-types/importing/dist/types.d.ts'),
        'utf8',
      )
    ).replace(/\r\n/g, '\n');
    let expected = await inputFS.readFile(
      path.join(__dirname, '/integration/ts-types/importing/expected.d.ts'),
      'utf8',
    );
    assert.equal(dist, expected);
  });

  test('should generate ts declarations with exports', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/ts-types/exporting/index.ts'),
    );

    assertBundles(b, [
      {
        type: 'js',
        assets: ['index.ts', 'message.ts', 'other.ts', 'test.ts'],
      },
      {
        type: 'ts',
        assets: ['index.ts'],
        includedFiles: {
          'index.ts': [
            'message.ts',
            'other.ts',
            'test.ts',
            'lib.d.ts',
            'lib.dom.d.ts',
            'lib.es5.d.ts',
            'lib.scripthost.d.ts',
            'lib.webworker.importscripts.d.ts',
          ],
        },
      },
    ]);

    let dist = (
      await outputFS.readFile(
        path.join(__dirname, '/integration/ts-types/exporting/dist/types.d.ts'),
        'utf8',
      )
    ).replace(/\r\n/g, '\n');
    let expected = await inputFS.readFile(
      path.join(__dirname, '/integration/ts-types/exporting/expected.d.ts'),
      'utf8',
    );
    assert.equal(dist, expected);
  });

  test('should generate ts declarations with externals', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/ts-types/externals/index.tsx'),
    );

    assertBundles(b, [
      {
        type: 'js',
        assets: ['index.tsx', 'other.tsx'],
      },
      {
        type: 'ts',
        assets: ['index.tsx'],
        includedFiles: {
          'index.ts': ['other.tsx'],
        },
      },
    ]);

    let dist = (
      await outputFS.readFile(
        path.join(__dirname, '/integration/ts-types/externals/dist/types.d.ts'),
        'utf8',
      )
    ).replace(/\r\n/g, '\n');
    let expected = await inputFS.readFile(
      path.join(__dirname, '/integration/ts-types/externals/expected.d.ts'),
      'utf8',
    );
    assert.equal(dist, expected);
  });

  test('should remove private properties', async () => {
    await bundle(
      path.join(__dirname, '/integration/ts-types/private/index.ts'),
    );

    let dist = (
      await outputFS.readFile(
        path.join(__dirname, '/integration/ts-types/private/dist/types.d.ts'),
        'utf8',
      )
    ).replace(/\r\n/g, '\n');
    let expected = await inputFS.readFile(
      path.join(__dirname, '/integration/ts-types/private/expected.d.ts'),
      'utf8',
    );
    assert.equal(dist, expected);
  });

  test('should not throw errors on typing of a callback which returns a promise or value', async () => {
    await bundle(
      path.join(__dirname, '/integration/ts-types/promise-or-value/index.ts'),
    );

    let dist = (
      await outputFS.readFile(
        path.join(
          __dirname,
          '/integration/ts-types/promise-or-value/dist/types.d.ts',
        ),
        'utf8',
      )
    ).replace(/\r\n/g, '\n');

    let expected = await inputFS.readFile(
      path.join(
        __dirname,
        '/integration/ts-types/promise-or-value/expected.d.ts',
      ),
      'utf8',
    );
    assert.equal(dist, expected);
  });
});
