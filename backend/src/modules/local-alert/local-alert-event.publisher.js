import { EventEmitter } from "node:events";

export const LOCAL_ALERT_REQUESTED = "local-alert.requested";

export function createLocalAlertEventPublisher() {
  const emitter = new EventEmitter();

  return {
    subscribe(listener) {
      emitter.on(LOCAL_ALERT_REQUESTED, listener);
      return () => emitter.off(LOCAL_ALERT_REQUESTED, listener);
    },

    async publish(event) {
      const listeners = emitter.listeners(LOCAL_ALERT_REQUESTED);
      await Promise.all(listeners.map((listener) => listener(event)));
    },
  };
}
