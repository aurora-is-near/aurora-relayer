/* This is free and unencumbered software released into the public domain. */
import pg from 'pg';
import sql from 'sql-bricks-postgres';
const sqlConvert = sql.convert;
sql.convert = (val) => {
    if (val instanceof Uint8Array) {
        return `'\\x${Buffer.from(val).toString('hex')}'`;
    }
    return sqlConvert(val);
};
export { pg, sql };
