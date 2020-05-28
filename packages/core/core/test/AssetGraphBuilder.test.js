// @flow strict-local
import invariant from 'assert';

import {createWorkerFarm} from '../';
import AssetGraphBuilder from '../src/AssetGraphBuilder';
import {DEFAULT_OPTIONS} from './utils';

describe('AssetGraphBuilder', () => {
  test('creates an AssetGraphBuilder', async () => {
    let workerFarm = createWorkerFarm();
    let builder = new AssetGraphBuilder();
    await builder.init({
      name: 'test',
      options: DEFAULT_OPTIONS,
      optionsRef: 1,
      entries: ['./module-b'],
      workerFarm,
    });
    invariant(builder.assetGraph.nodes.has('entry_specifier:./module-b'));
    await workerFarm.end();
  }, 20000);
});
