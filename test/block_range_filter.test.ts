import { blockRangeFilter } from '../src/utils';

describe('Block range filter', () => {
  test('filter has block range properties', () => {
    const filter = {
      fromBlock: '0x0',
      toBlock: '0x0',
    };

    expect(blockRangeFilter(filter)).toBe(true)
  })

  test('empty filter', () => {
    const filter = {}

    expect(blockRangeFilter(filter)).toBe(false)
  })

  test('filter with topic key', () => {
    const filter = {
      topics: ['0x0'],
    }

    expect(blockRangeFilter(filter)).toBe(false)
  })

  test('filter with address key', () => {
    const filter = {
      address: '0x0',
    }

    expect(blockRangeFilter(filter)).toBe(false)
  })

  test('filter with blockHash key', () => {
    const filter = {
      blockHash: '0x0',
    }

    expect(blockRangeFilter(filter)).toBe(false)
  })

  test('filter with fromBlock key', () => {
    const filter = {
      fromBlock: '0x0',
    }

    expect(blockRangeFilter(filter)).toBe(true)
  })

  test('filter with toBlock key', () => {
    const filter = {
      toBlock: '0x0',
    }

    expect(blockRangeFilter(filter)).toBe(true)
  })

  test('filter with not range keys', () => {
    const filter = {
      fromBlock: '0x0',
      toBlock: '0x0',
      blockHash: '0x0',
      address: '0x0',
      topics: ['0x0'],
    }

    expect(blockRangeFilter(filter)).toBe(false)
  })

  test('range block filter with other key', () => {
    const filter = {
      fromBlock: '0x0',
      toBlock: '0x0',
      otherKey: '0x0',
    }

    expect(blockRangeFilter(filter)).toBe(true)
  })
})
