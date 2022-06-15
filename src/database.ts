/* This is free and unencumbered software released into the public domain. */

import pg from 'pg';

import sql from 'sql-bricks-postgres';

const sqlConvert = (sql as any).convert;
(sql as any).convert = (val: unknown) => {
  if (val instanceof Uint8Array) {
    return `\\x${Buffer.from(val).toString('hex')}`;
  }
  return sqlConvert(val);
};

export { pg, sql };
