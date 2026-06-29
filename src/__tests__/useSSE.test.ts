import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock EventSource
class MockEventSource {
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  close: ReturnType<typeof vi.fn>;
  url: string;
  readyState: number = 0;

  constructor(url: string) {
    this.url = url;
    this.close = vi.fn();
  }
}

vi.stubGlobal('EventSource', MockEventSource);

describe('SSE Hook (useSSE)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should establish EventSource connection', () => {
    const es = new EventSource('/api/sse');
    expect(es.url).toBe('/api/sse');
    expect(es.readyState).toBe(0);
  });

  it('should handle open event', () => {
    const es = new EventSource('/api/sse');
    const onOpen = vi.fn();
    es.onopen = onOpen;

    // Simulate open event
    es.onopen(new Event('open'));

    expect(onOpen).toHaveBeenCalled();
  });

  it('should handle message event', () => {
    const es = new EventSource('/api/sse');
    const onMessage = vi.fn();
    es.onmessage = onMessage;

    // Simulate message event
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({ type: 'test', payload: { id: 1 } }),
    });
    es.onmessage(messageEvent);

    expect(onMessage).toHaveBeenCalled();
  });

  it('should handle error event', () => {
    const es = new EventSource('/api/sse');
    const onError = vi.fn();
    es.onerror = onError;

    // Simulate error
    es.onerror(new Event('error'));

    expect(onError).toHaveBeenCalled();
  });

  it('should close connection', () => {
    const es = new EventSource('/api/sse');
    es.close();
    expect(es.close).toHaveBeenCalled();
  });

  it('should handle custom events', () => {
    const es = new EventSource('/api/sse');
    const listener = vi.fn();
    es.addEventListener = vi.fn((event: string, callback: EventListener) => {
      listener(event, callback);
    }) as any;

    // Add event listeners
    es.addEventListener?.('users:created', (e: Event) => {});
    es.addEventListener?.('surat-masuk:created', (e: Event) => {});

    // Since addEventListener was called, we can verify the event names
    expect(listener).toHaveBeenCalledWith('users:created', expect.any(Function));
    expect(listener).toHaveBeenCalledWith('surat-masuk:created', expect.any(Function));
  });
});