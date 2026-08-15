import { SessionEvent } from './types';

export function createEventEmitter() {
  let controller: ReadableStreamDefaultController<string>;

  const stream = new ReadableStream<string>({
    start(c) {
      controller = c;
    },
    cancel() {
      // Handle cleanup if needed
    },
  });

  const emit = (event: SessionEvent) => {
    if (controller) {
      const data = JSON.stringify(event);
      controller.enqueue(`data: ${data}\n\n`);
    }
  };

  const close = () => {
    if (controller) {
      controller.close();
    }
  };

  return {
    stream,
    emit,
    close,
  };
}
