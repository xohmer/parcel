import assert from 'assert';
import {bundle, assertBundles, outputFS, distDir} from '@parcel/test-utils';
import path from 'path';

describe('sugarss', () => {
  test('should correctly parse SugarSS asset', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/sugarss/index.sss'),
    );

    assertBundles(b, [
      {
        name: 'index.css',
        assets: ['index.sss'],
      },
    ]);

    let cssContent = await outputFS.readFile(
      path.join(distDir, '/index.css'),
      'utf8',
    );
    assert(cssContent.includes('{'));
  });
});
