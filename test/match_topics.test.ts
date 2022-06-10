/* This is free and unencumbered software released into the public domain. */

import { matchTopics } from '../src/topics';

describe('Match topics', () => {
  test('null in transactionTopics', async () => {
    const filterTopics = [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    ]

    const transactionTopics = null

    expect(matchTopics(filterTopics, transactionTopics)).toBe(false)
  })

  test('[] in transactionTopics', async () => {
    const filterTopics = [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    ]

    const transactionTopics: [] = []

    expect(matchTopics(filterTopics, transactionTopics)).toBe(false)
  })

  describe('with null params', () => {
    test('with one topic as filter', async () => {
      const filterTopics = [
        null,
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      ]

      const transactionTopics = [
        '0x000000000000000000000000a5df6d8d59a7fbdb8a11e23fda9d11c4103dc49f',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(true)
    })

    test('with one topic as filter and three null', async () => {
      const filterTopics = [
        null,
        null,
        null,
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      const transactionTopics = [
        '0x000000000000000000000000a5df6d8d59a7fbdb8a11e23fda9d11c4103dc49f',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(true)
    })

    test(`three null, topics don't exist in the transaction`, async () => {
      const filterTopics = [
        null,
        null,
        '0x000000000000000000000000dd58a0e3db99a98839086ccdabfa49e979290812',
        null,
      ]

      const transactionTopics = [
        '0x000000000000000000000000a5df6d8d59a7fbdb8a11e23fda9d11c4103dc49f',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(false)
    })
  })

  describe('with empty array and null in params', () => {
    test('empty array as first param, with one topic as filter', async () => {
      const filterTopics = [
        [],
        null,
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      const transactionTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(true)
    })

    test('empty array as first param, with one topic as filter at the start of transaction', async () => {
      const filterTopics = [
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
        [],
        null,
      ]

      const transactionTopics = [
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(true)
    })
  })

  describe('with empty array in params', () => {
    test('empty array as first param, with one topic as filter', async () => {
      const filterTopics = [
        [],
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      ]

      const transactionTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(true)
    })

    test('empty array as first param, with one topic as filter in first index', async () => {
      const filterTopics = [
        [],
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      ]

      const transactionTopics = [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000003cae5c23bfca0a1e2834fa6ffd2c55a32c11ddc9",
        "0x0000000000000000000000003838956710bcc9d122dd23863a0549ca8d5675d6"
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(false)
    })

    test(`empty array as first param, topics don't exist in the transaction`, async () => {
      const filterTopics = [
        [],
        '0x000000000000000000000000dd58a0e3db99a98839086ccdabfa49e979290812',
      ]

      const transactionTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(false)
    })

    test('empty array as second param, with one topic as filter', async () => {
      const filterTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        [],
      ]

      const transactionTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(true)
    })

    test(`empty array as second param, topics don't exist in the transaction`, async () => {
      const filterTopics = [
        '0x000000000000000000000000dd58a0e3db99a98839086ccdabfa49e979290812',
        [],
      ]

      const transactionTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(false)
    })
  })

  describe('with array in params', () => {
    test('[] in filterTopics', async () => {
      const filterTopics = [[]]

      const transactionTopics: [] = []

      expect(matchTopics(filterTopics, transactionTopics)).toBe(true)
    })

    test('with one topic as filter', async () => {
      const filterTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        [
          '0x000000000000000000000000a5df6d8d59a7fbdb8a11e23fda9d11c4103dc49f',
          '0x000000000000000000000000dd58a0e3db99a98839086ccdabfa49e979290812',
        ],
      ]

      const transactionTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000a5df6d8d59a7fbdb8a11e23fda9d11c4103dc49f',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(true)
    })

    test(`with one topic as filter, topics don't exist in the transaction`, async () => {
      const filterTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        [
          '0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616',
          '0x000000000000000000000000adf9d0c77c70fcb1fdb868f54211288fce9937df',
        ],
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      const transactionTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000a5df6d8d59a7fbdb8a11e23fda9d11c4103dc49f',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(false)
    })

    test(`with one topic as filter, topics don't exist in the transaction`, async () => {
      const filterTopics = [
        null,
        [
          '0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616',
          '0x000000000000000000000000adf9d0c77c70fcb1fdb868f54211288fce9937df',
        ],
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      const transactionTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(true)
    })
  })

  describe('string params', () => {
    test('with one topic as filter', async () => {
      const filterTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      ]

      const transactionTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000a5df6d8d59a7fbdb8a11e23fda9d11c4103dc49f',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(true)
    })

    test(`with one topic as filter, topics don't exist in the transaction`, async () => {
      const filterTopics = [
        '0x000000000000000000000000dd58a0e3db99a98839086ccdabfa49e979290812',
      ]

      const transactionTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000a5df6d8d59a7fbdb8a11e23fda9d11c4103dc49f',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(false)
    })

    test('with two topics as filter', async () => {
      const filterTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      ]

      const transactionTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000a5df6d8d59a7fbdb8a11e23fda9d11c4103dc49f',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(false)
    })

    test('with three topics as filter', async () => {
      const filterTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      ]

      const transactionTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000a5df6d8d59a7fbdb8a11e23fda9d11c4103dc49f',
        '0x00000000000000000000000003ddd5a675e2cfa35b9ae2b207a7dbd95fe24646',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(false)
    })

    test('with three topics as filter', async () => {
      const filterTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      ]

      const transactionTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(true)
    })

    test('with four topics as filter', async () => {
      const filterTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      ]

      const transactionTopics = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      ]

      expect(matchTopics(filterTopics, transactionTopics)).toBe(false)
    })
  })
})
