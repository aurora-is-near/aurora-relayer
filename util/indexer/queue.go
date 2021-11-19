// This is free and unencumbered software released into the public domain.

package main

import (
	"container/heap"
	"sync"
)

type Queue struct {
	items []int64
	mutex sync.RWMutex
}

func CreateQueue() *Queue {
	queue := &Queue{}
	heap.Init(queue)
	return queue
}

func (queue *Queue) Enqueue(x int64) {
	queue.mutex.Lock()
	defer queue.mutex.Unlock()
	heap.Push(queue, x)
}

func (queue *Queue) Dequeue() int64 {
	queue.mutex.Lock()
	defer queue.mutex.Unlock()
	if queue.Len() == 0 {
		return -1
	}
	return heap.Pop(queue).(int64)
}

func (queue *Queue) Len() int {
	queue.mutex.Lock()
	defer queue.mutex.Unlock()
	return len(queue.items)
}

func (queue *Queue) Less(i, j int) bool {
	return queue.items[i] > queue.items[j]
}

func (queue *Queue) Swap(i, j int) {
	queue.items[i], queue.items[j] = queue.items[j], queue.items[i]
}

func (queue *Queue) Push(x interface{}) {
	queue.items = append(queue.items, x.(int64))
}

func (queue *Queue) Pop() interface{} {
	old := queue.items
	n := len(old)
	if n == 0 {
		return nil
	}
	x := old[n-1]
	queue.items = old[0 : n-1]
	return x
}
