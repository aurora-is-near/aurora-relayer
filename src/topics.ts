/* This is free and unencumbered software released into the public domain. */

import * as web3 from './web3';

import sql from 'sql-bricks';

export function compileTopics(
  topics: web3.FilterTopic[]
): sql.WhereExpression | null {
  if (!topics || topics.length == 0) return null;
  if (Array.isArray(topics)) {
    const flattenedTopics = topics.flat(Infinity);
    const isEmptyTopics = flattenedTopics.every((topic) => {
      return topic === null;
    });
    if (isEmptyTopics) return null;
  }
  const operands: sql.WhereExpression[] = topics
    .map((topic: web3.FilterTopic, i: number): sql.WhereExpression[] => {
      if (topic === null) return [];
      if (typeof topic === 'string') {
        return [sql.eq(`e.topics[${i + 1}]`, hexToBytes(topic))];
      }
      if (Array.isArray(topic)) {
        if (!topic.length) return [];
        const operands: sql.WhereExpression[] = topic
          .map((topic: web3.FilterTopic): sql.WhereExpression[] => {
            if (topic === null) return [];
            return [sql.eq(`e.topics[${i + 1}]`, hexToBytes(topic as string))];
          })
          .flat();
        return [sql.or(...operands)];
      }
      throw Error('unreachable');
    })
    .flat();
  return sql.and(...operands);
}

// Duplicated here because of https://github.com/kulshekhar/ts-jest/issues/970
function hexToBytes(input: string): Uint8Array {
  return Buffer.from(input.substring(2), 'hex');
}

export function matchTopics(
  topics: Array<string | null | Array<string>>,
  topicsInTransaction: string[] | null | any[]
): boolean {
  return topics.every((topic, i) => {
    if (topic === null || (Array.isArray(topic) && !topic.length)) {
      return true;
    }

    // can be removed after https://github.com/aurora-is-near/aurora-relayer/pull/293 merge
    if (!Array.isArray(topicsInTransaction)) {
      return false;
    }

    if (Array.isArray(topic)) {
      return topic.includes(topicsInTransaction[i]);
    }

    if (topic !== topicsInTransaction[i]) {
      return false;
    }

    return true;
  });
}
