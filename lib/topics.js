/* This is free and unencumbered software released into the public domain. */
import sql from 'sql-bricks';
export function compileTopics(topics) {
    if (!topics || topics.length == 0)
        return null;
    if (Array.isArray(topics)) {
        const isEmptyTopics = topics.every((topic) => {
            if (topic === null || (Array.isArray(topic) && !topic.length)) {
                return true;
            }
            if (Array.isArray(topic)) {
                return topic.every((value) => {
                    if (value === null || (Array.isArray(value) && !value.length)) {
                        return true;
                    }
                    return false;
                });
            }
            return false;
        });
        if (isEmptyTopics)
            return null;
    }
    const operands = topics
        .map((topic, i) => {
        if (topic === null)
            return [];
        if (typeof topic === 'string') {
            return [sql.eq(`e.topics[${i + 1}]`, hexToBytes(topic))];
        }
        if (Array.isArray(topic)) {
            if (!topic.length)
                return [];
            const operands = topic
                .map((topic) => {
                if (topic === null)
                    return [];
                return [sql.eq(`e.topics[${i + 1}]`, hexToBytes(topic))];
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
function hexToBytes(input) {
    return Buffer.from(input.substring(2), 'hex');
}
export function matchTopics(topics, topicsInTransaction) {
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
