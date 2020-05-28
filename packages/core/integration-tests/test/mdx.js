const assert = require('assert');
const path = require('path');
const {bundle, run} = require('@parcel/test-utils');

describe('mdx', () => {
  test('should support bundling MDX', async () => {
    let b = await bundle(path.join(__dirname, '/integration/mdx/index.mdx'));

    let output = await run(b);
    assert.equal(typeof output.default, 'function');
    assert(output.default.isMDXComponent);
  });
});
