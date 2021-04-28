/* This is free and unencumbered software released into the public domain. */

import { compileTopics } from '../src/topics';

// See: https://eth.wiki/json-rpc/API#eth_newFilter

const A = 'A';
const B = 'B';

test('[] matches anything', () => {
    const where = compileTopics([]);
    expect(where).toEqual(null);
});

test('[A] matches A in topics[0]', () => {
    const where = compileTopics([A]);
    expect(where!.toString()).toEqual("e.topics[0] = 'A'");
});

test('[null, B] matches anything in topics[0] and B in topics[1]', () => {
    const where = compileTopics([null, B]);
    expect(where!.toString()).toEqual("e.topics[1] = 'B'");
});

test('[A, B] matches A in topics[0] and B in topics[1]', () => {
    const where = compileTopics([A, B]);
    expect(where!.toString()).toEqual("(e.topics[0] = 'A' AND e.topics[1] = 'B')");
});

test('[[A, B]] matches A or B in topics[0]', () => {
    const where = compileTopics([[A, B]]);
    expect(where!.toString()).toEqual("(e.topics[0] = 'A' OR e.topics[0] = 'B')");
});

test('[[A, B], [A, B]] matches A or B in topics[0] and A or B in topics[1]', () => {
    const where = compileTopics([[A, B], [A, B]]);
    expect(where!.toString()).toEqual("((e.topics[0] = 'A' OR e.topics[0] = 'B') AND (e.topics[1] = 'A' OR e.topics[1] = 'B'))");
});
