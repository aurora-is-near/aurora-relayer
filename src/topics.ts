/* This is free and unencumbered software released into the public domain. */

import * as api from './api';
import sql from 'sql-bricks';

export function compileTopics(topics: api.FilterTopic[]): sql.WhereExpression | null {
    if (!topics || topics.length == 0) return null;
    const operands: sql.WhereExpression[] = topics.map((topic: api.FilterTopic, i: number): sql.WhereExpression[] => {
        if (topic === null) return [];
        if (typeof topic === 'string') {
            return [sql.eq(`e.topics[${ i }]`, topic)];
        }
        if (Array.isArray(topic)) {
            const operands: sql.WhereExpression[] = topic.map((topic: api.FilterTopic): sql.WhereExpression[] => {
                if (topic === null) return [];
                return [sql.eq(`e.topics[${ i }]`, topic)];
            }).flat();
            return [sql.or(...operands)];
        }
        throw Error('unreachable');
    }).flat();
    return sql.and(...operands);
}
