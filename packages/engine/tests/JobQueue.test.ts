import { JobQueue } from '../JobQueue';
import { Job } from '../Job';

describe('JobQueue', () => {
  let queue: JobQueue;

  beforeEach(() => {
    queue = new JobQueue();
  });

  describe('enqueue', () => {
    it('should add a job to the queue', () => {
      const job = queue.enqueue('manual', { test: 'data' });
      expect(queue.size()).toBe(1);
      expect(job.type).toBe('manual');
    });

    it('should sort jobs by priority', () => {
      const job1 = queue.enqueue('manual', { test: '1' }, 1);
      const job2 = queue.enqueue('manual', { test: '2' }, 5);
      const job3 = queue.enqueue('manual', { test: '3' }, 3);

      expect(queue.peek()?.id).toBe(job2.id);
    });
  });

  describe('dequeue', () => {
    it('should remove and return the first job', () => {
      const job1 = queue.enqueue('manual', { test: '1' });
      const job2 = queue.enqueue('manual', { test: '2' });

      const dequeued = queue.dequeue();
      expect(dequeued?.id).toBe(job1.id);
      expect(queue.size()).toBe(1);
    });

    it('should return null when queue is paused', () => {
      queue.enqueue('manual', { test: '1' });
      queue.pause();
      const dequeued = queue.dequeue();
      expect(dequeued).toBeNull();
    });

    it('should return null when queue is empty', () => {
      const dequeued = queue.dequeue();
      expect(dequeued).toBeNull();
    });
  });

  describe('peek', () => {
    it('should return the first job without removing it', () => {
      const job = queue.enqueue('manual', { test: 'data' });
      const peeked = queue.peek();
      expect(peeked?.id).toBe(job.id);
      expect(queue.size()).toBe(1);
    });
  });

  describe('remove', () => {
    it('should remove a job by id', () => {
      const job = queue.enqueue('manual', { test: 'data' });
      const removed = queue.remove(job.id);
      expect(removed).toBe(true);
      expect(queue.size()).toBe(0);
    });

    it('should return false if job not found', () => {
      const removed = queue.remove('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('pause and resume', () => {
    it('should pause the queue', () => {
      queue.pause();
      expect(queue.isPaused()).toBe(true);
    });

    it('should resume the queue', () => {
      queue.pause();
      queue.resume();
      expect(queue.isPaused()).toBe(false);
    });
  });

  describe('cancel', () => {
    it('should cancel all jobs', () => {
      queue.enqueue('manual', { test: '1' });
      queue.enqueue('manual', { test: '2' });
      queue.cancel();
      expect(queue.size()).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all jobs', () => {
      queue.enqueue('manual', { test: '1' });
      queue.enqueue('manual', { test: '2' });
      queue.clear();
      expect(queue.size()).toBe(0);
    });
  });
});
