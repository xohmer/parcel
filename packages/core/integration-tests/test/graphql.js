import assert from 'assert';
import path from 'path';
import gql from 'graphql-tag';
import {bundle, run} from '@parcel/test-utils';

describe('graphql', () => {
  test('should support requiring graphql files', async () => {
    let b = await bundle(path.join(__dirname, '/integration/graphql/index.js'));

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert.deepEqual(
      output().definitions,
      gql`
        {
          user(id: 5) {
            ...UserFragment
          }
        }

        fragment UserFragment on User {
          firstName
          lastName
        }
      `.definitions,
    );
  });

  test('should support importing other graphql files from a graphql file', async () => {
    let b = await bundle(
      path.join(__dirname, '/integration/graphql-import/index.js'),
    );

    let output = await run(b);
    assert.equal(typeof output, 'function');
    assert.deepEqual(
      output().definitions,
      gql`
        {
          user(id: 6) {
            ...UserFragment
            ...AnotherUserFragment
          }
        }

        fragment UserFragment on User {
          firstName
          lastName
        }

        fragment AnotherUserFragment on User {
          address
          email
        }
      `.definitions,
    );
  });
});
