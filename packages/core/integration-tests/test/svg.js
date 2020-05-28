import assert from 'assert';
import {
  bundle,
  removeDistDirectory,
  distDir,
  outputFS,
} from '@parcel/test-utils';
import defaultConfigContents from '@parcel/config-default';
import path from 'path';

const config = {
  ...defaultConfigContents,
  transformers: {
    ...defaultConfigContents.transformers,
    '*.svg': ['@parcel/transformer-svgo', '@parcel/transformer-svg-react'],
  },
  reporters: [],
  filePath: require.resolve('@parcel/config-default'),
};

describe('svg', () => {
  afterEach(async () => {
    await removeDistDirectory();
  });

  test('should support transforming SVGs to react components', async () => {
    await bundle(path.join(__dirname, '/integration/svg/index.js'), {
      defaultConfig: config,
    });

    let file = await outputFS.readFile(path.join(distDir, 'index.js'), 'utf-8');
    assert(file.includes('function SvgIcon'));
    assert(file.includes('_react.default.createElement("svg"'));
  });
});
