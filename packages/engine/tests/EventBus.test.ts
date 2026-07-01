import { EventBus } from '../EventBus';
import type { EventType } from '../types';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('on', () => {
    it('should register a listener', () => {
      const listener = jest.fn();
      eventBus.on('job.created', listener);
      expect(eventBus.listenerCount('job.created')).toBe(1);
    });

    it('should call the listener when event is emitted', () => {
      const listener = jest.fn();
      eventBus.on('job.created', listener);
      eventBus.emit('job.created', { jobId: 'test-123', type: 'manual' });
      expect(listener).toHaveBeenCalledWith({
        jobId: 'test-123',
        type: 'manual',
      });
    });

    it('should allow multiple listeners for the same event', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      eventBus.on('job.created', listener1);
      eventBus.on('job.created', listener2);
      eventBus.emit('job.created', { jobId: 'test-123', type: 'manual' });
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('once', () => {
    it('should register a one-time listener', () => {
      const listener = jest.fn();
      eventBus.once('job.completed', listener);
      eventBus.emit('job.completed', {
        jobId: 'test-123',
        result: {},
        duration: 100,
      });
      eventBus.emit('job.completed', {
        jobId: 'test-456',
        result: {},
        duration: 200,
      });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('off', () => {
    it('should remove a listener', () => {
      const listener = jest.fn();
      eventBus.on('job.created', listener);
      eventBus.off('job.created', listener);
      eventBus.emit('job.created', { jobId: 'test-123', type: 'manual' });
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for a specific event', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      eventBus.on('job.created', listener1);
      eventBus.on('job.created', listener2);
      eventBus.removeAllListeners('job.created');
      eventBus.emit('job.created', { jobId: 'test-123', type: 'manual' });
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should remove all listeners when no event specified', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      eventBus.on('job.created', listener1);
      eventBus.on('job.completed', listener2);
      eventBus.removeAllListeners();
      eventBus.emit('job.created', { jobId: 'test-123', type: 'manual' });
      eventBus.emit('job.completed', {
        jobId: 'test-123',
        result: {},
        duration: 100,
      });
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should not propagate errors from listeners', () => {
      const listener = jest.fn(() => {
        throw new Error('Test error');
      });
      eventBus.on('job.created', listener);
      expect(() => {
        eventBus.emit('job.created', { jobId: 'test-123', type: 'manual' });
      }).not.toThrow();
    });
  });
});
