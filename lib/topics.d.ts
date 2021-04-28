import * as api from './api';
import sql from 'sql-bricks';
export declare function compileTopics(topics: api.FilterTopic[]): sql.WhereExpression | null;
