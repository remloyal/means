import EventEmitter from 'events';

declare global {
  interface Window {
    eventBus: EventEmitter;
  }
}
