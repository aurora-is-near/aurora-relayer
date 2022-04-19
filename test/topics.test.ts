/* This is free and unencumbered software released into the public domain. */

import { compileTopics } from '../src/topics';

// See: https://eth.wiki/json-rpc/API#eth_newFilter

const A = '0xAA';
const B = '0xBB';

import sql from 'sql-bricks';
const sqlConvert = (sql as any).convert;
(sql as any).convert = (val: unknown) => {
  if (val instanceof Uint8Array) {
    return `'\\x${Buffer.from(val).toString('hex')}'`;
  }
  return sqlConvert(val);
};

test('[] matches anything', () => {
  const where = compileTopics([]);
  expect(where).toEqual(null);
});

test('[A] matches A in topics[0]', () => {
  const where = compileTopics([A]);
  expect(where!.toString()).toEqual("e.topics[1] = '\\xaa'");
});

test('[null, B] matches anything in topics[0] and B in topics[2]', () => {
  const where = compileTopics([null, B]);
  expect(where!.toString()).toEqual("e.topics[2] = '\\xbb'");
});

test('[A, B] matches A in topics[1] and B in topics[2]', () => {
  const where = compileTopics([A, B]);
  expect(where!.toString()).toEqual(
    "(e.topics[1] = '\\xaa' AND e.topics[2] = '\\xbb')"
  );
});

test('[[A, B]] matches A or B in topics[1]', () => {
  const where = compileTopics([[A, B]]);
  expect(where!.toString()).toEqual(
    "(e.topics[1] = '\\xaa' OR e.topics[1] = '\\xbb')"
  );
});

test('[[A, B], [A, B]] matches A or B in topics[1] and A or B in topics[2]', () => {
  const where = compileTopics([
    [A, B],
    [A, B],
  ]);
  expect(where!.toString()).toEqual(
    "((e.topics[1] = '\\xaa' OR e.topics[1] = '\\xbb') AND (e.topics[2] = '\\xaa' OR e.topics[2] = '\\xbb'))"
  );
});
