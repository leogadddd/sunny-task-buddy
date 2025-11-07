/**
 * Pub/Sub Event System for Real-Time Updates
 * Designed to work with WebSocket subscriptions and be Redis-ready for scaling
 *
 * Currently uses in-memory event emitter (suitable for single server)
 * Future: Replace with Redis Pub/Sub for multi-server deployment
 */

import { EventEmitter } from "events";

// Event types for dropdown operations
export enum DropdownEventType {
  FIELD_CREATED = "dropdown:field:created",
  FIELD_UPDATED = "dropdown:field:updated",
  FIELD_DELETED = "dropdown:field:deleted",
  OPTION_CREATED = "dropdown:option:created",
  OPTION_UPDATED = "dropdown:option:updated",
  OPTION_DELETED = "dropdown:option:deleted",
  OPTION_SELECTED = "dropdown:option:selected",
  OPTION_DESELECTED = "dropdown:option:deselected",
}

export interface DropdownEventPayload {
  taskId: string;
  fieldId?: string;
  optionId?: string;
  userId: string;
  timestamp: Date;
  data: any;
}

/**
 * Pub/Sub manager for dropdown events
 * Can be extended to support Redis Pub/Sub
 */
class PubSubManager {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100); // For SaaS scale
  }

  /**
   * Subscribe to dropdown events for a specific task
   * Returns an async iterator for GraphQL subscriptions
   */
  subscribe(taskId: string, eventType: DropdownEventType) {
    const channel = `${eventType}:${taskId}`;

    return {
      [Symbol.asyncIterator]: () => {
        const queue: DropdownEventPayload[] = [];
        let resolver:
          | ((value: IteratorResult<DropdownEventPayload>) => void)
          | null = null;

        const handler = (payload: DropdownEventPayload) => {
          if (resolver) {
            resolver({ value: payload, done: false });
            resolver = null;
          } else {
            queue.push(payload);
          }
        };

        this.emitter.on(channel, handler);

        return {
          next: () => {
            return new Promise<IteratorResult<DropdownEventPayload>>(
              (resolve) => {
                if (queue.length > 0) {
                  const value = queue.shift()!;
                  resolve({ value, done: false });
                } else {
                  resolver = resolve;
                }
              }
            );
          },
          return: async () => {
            this.emitter.off(channel, handler);
            return { value: undefined, done: true };
          },
          throw: async (error: any) => {
            this.emitter.off(channel, handler);
            throw error;
          },
        };
      },
    };
  }

  /**
   * Publish a dropdown event
   * In production with multiple servers, this would publish to Redis
   */
  publish(eventType: DropdownEventType, payload: DropdownEventPayload) {
    const channel = `${eventType}:${payload.taskId}`;
    this.emitter.emit(channel, payload);

    // TODO: For Redis scaling, publish to Redis here:
    // await redisClient.publish(channel, JSON.stringify(payload));
  }

  /**
   * Publish to multiple task channels (useful for field updates affecting multiple tasks)
   */
  publishToTasks(
    eventType: DropdownEventType,
    taskIds: string[],
    payload: Omit<DropdownEventPayload, "taskId">
  ) {
    taskIds.forEach((taskId) => {
      this.publish(eventType, {
        ...payload,
        taskId,
      });
    });
  }

  /**
   * Redis-ready: Subscribe to raw channel (for future Redis implementation)
   */
  subscribeChannel(channel: string) {
    return {
      [Symbol.asyncIterator]: () => {
        const queue: any[] = [];
        let resolver: ((value: IteratorResult<any>) => void) | null = null;

        const handler = (payload: any) => {
          if (resolver) {
            resolver({ value: payload, done: false });
            resolver = null;
          } else {
            queue.push(payload);
          }
        };

        this.emitter.on(channel, handler);

        return {
          next: () => {
            return new Promise<IteratorResult<any>>((resolve) => {
              if (queue.length > 0) {
                const value = queue.shift()!;
                resolve({ value, done: false });
              } else {
                resolver = resolve;
              }
            });
          },
          return: async () => {
            this.emitter.off(channel, handler);
            return { value: undefined, done: true };
          },
          throw: async (error: any) => {
            this.emitter.off(channel, handler);
            throw error;
          },
        };
      },
    };
  }

  /**
   * Get listener count for monitoring
   */
  getListenerCount(channel: string): number {
    return this.emitter.listenerCount(channel);
  }
}

// Global singleton instance
export const pubSub = new PubSubManager();

/**
 * Helper: Create a typed subscription for a specific event
 */
export function subscribeToDropdownEvent(
  taskId: string,
  eventType: DropdownEventType
) {
  return pubSub.subscribe(taskId, eventType);
}

/**
 * Helper: Publish a typed dropdown event
 */
export function publishDropdownEvent(
  eventType: DropdownEventType,
  payload: DropdownEventPayload
) {
  pubSub.publish(eventType, payload);
}
