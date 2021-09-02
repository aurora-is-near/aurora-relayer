import * as web3 from './web3';
import sql from 'sql-bricks';
export declare function compileTopics(topics: web3.FilterTopic[]): sql.WhereExpression | null;
