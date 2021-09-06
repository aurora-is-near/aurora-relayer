/* This is free and unencumbered software released into the public domain. */

import * as web3 from './web3';

import sql from 'sql-bricks';

export function compileTopics(
  topics: web3.FilterTopic[]
): sql.WhereExpression | null {
  if (!topics || topics.length == 0) return null;
  const operands: sql.WhereExpression[] = topics
    .map((topic: web3.FilterTopic, i: number): sql.WhereExpression[] => {
      if (topic === null) return [];
      if (typeof topic === 'string') {
        return [sql.eq(`e.topics[${i+1}]`, hexToBytes(topic))];
      }
      if (Array.isArray(topic)) {
        const operands: sql.WhereExpression[] = topic
          .map((topic: web3.FilterTopic): sql.WhereExpression[] => {
            if (topic === null) return [];
            return [sql.eq(`e.topics[${i+1}]`, hexToBytes(topic as string))];
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
