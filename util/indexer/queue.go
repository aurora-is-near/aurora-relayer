// This is free and unencumbered software released into the public domain.

package main

import (
	"container/heap"
	"sync"
)

type QueueBlock struct {
	IsHead   bool  `json:"is_head"`
	Id       int64 `json:"id"`
}

type Queue struct {
	items []QueueBlock
	mutex sync.RWMutex
}

func CreateQueue() *Queue {
	queue := &Queue{}
	heap.Init(queue)
	return queue
}

func (queue *Queue) Enqueue(x QueueBlock) {
	queue.mutex.Lock()
	defer queue.mutex.Unlock()
	heap.Push(queue, x)
}

func (queue *Queue) Dequeue() QueueBlock {
	queue.mutex.Lock()
	defer queue.mutex.Unlock()
	if queue.Len() == 0 {
		return QueueBlock{true, -1}
	}
	return heap.Pop(queue).(QueueBlock)
}

func (queue *Queue) LenSafe() int {
	queue.mutex.Lock()
	defer queue.mutex.Unlock()
	return len(queue.items)
}

func (queue *Queue) Len() int {
	return len(queue.items)
}

func (queue *Queue) Less(i, j int) bool {
	return queue.items[i].Id > queue.items[j].Id
}

func (queue *Queue) Swap(i, j int) {
	queue.items[i], queue.items[j] = queue.items[j], queue.items[i]
}

func (queue *Queue) Push(x interface{}) {
	queue.items = append(queue.items, x.(QueueBlock))
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
