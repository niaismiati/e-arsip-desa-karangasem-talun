import { useEffect, useRef } from 'react';

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 1000;

export function useSSE(
  events: string[],
  onRefresh: () => void,
  fallbackPollingMs = 30000
) {
  const savedCallback = useRef(onRefresh);
  const savedEvents = useRef(events);
  savedCallback.current = onRefresh;
  savedEvents.current = events;

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    if (!token) return;

    let es: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;
    let reconnectAttempts = 0;

    function startPolling() {
      if (pollTimer || destroyed) return;
      try {
        pollTimer = setInterval(() => {
          if (!destroyed) {
            try {
              savedCallback.current();
            } catch (e) {
              console.error('[useSSE] Polling callback error:', e);
            }
          }
        }, fallbackPollingMs);
      } catch (e) {
        console.error('[useSSE] Failed to start polling:', e);
      }
    }

    function stopPolling() {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    }

    function connect() {
      if (destroyed) return;
      try {
        es = new EventSource(`/api/stream?token=${token}`);

        es.onopen = () => {
          if (destroyed) { es?.close(); return; }
          reconnectAttempts = 0;
          stopPolling();
        };

        for (const event of savedEvents.current) {
          es.addEventListener(event, () => {
            if (!destroyed) {
              try {
                savedCallback.current();
              } catch (e) {
                console.error('[useSSE] Event callback error:', e);
              }
            }
          });
        }

        es.onerror = () => {
          if (destroyed) return;
          try { es?.close(); } catch {}
          es = null;

          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1);
            reconnectTimer = setTimeout(() => {
              if (!destroyed) connect();
            }, delay);
          } else {
            startPolling();
          }
        };
      } catch {
        if (!destroyed) startPolling();
      }
    }

    connect();

    return () => {
      destroyed = true;
      try { es?.close(); } catch {}
      if (reconnectTimer) clearTimeout(reconnectTimer);
      stopPolling();
    };
  }, [fallbackPollingMs]);
}
