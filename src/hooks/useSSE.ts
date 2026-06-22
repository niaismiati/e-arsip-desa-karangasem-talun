import { useEffect, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

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

    let ctrl: AbortController | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;
    let reconnectAttempts = 0;

    function startPolling() {
      if (pollTimer || destroyed) return;
      pollTimer = setInterval(() => {
        if (!destroyed) {
          try {
            savedCallback.current();
          } catch (e) {
            console.error('[useSSE] Polling callback error:', e);
          }
        }
      }, fallbackPollingMs);
    }

    function stopPolling() {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    }

    async function connect() {
      if (destroyed) return;
      ctrl = new AbortController();

      try {
        await fetchEventSource('/api/stream', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: ctrl.signal,
          onopen: async (response) => {
            if (destroyed) {
              ctrl?.abort();
              return;
            }
            if (response.ok) {
              reconnectAttempts = 0;
              stopPolling();
            } else {
              throw new Error(`SSE connection failed: ${response.status}`);
            }
          },
          onmessage: (event) => {
            if (destroyed) return;
            if (savedEvents.current.includes(event.event)) {
              try {
                savedCallback.current();
              } catch (e) {
                console.error('[useSSE] Event callback error:', e);
              }
            }
          },
          onerror: (err) => {
            if (destroyed) return;
            ctrl?.abort();
            ctrl = null;

            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
              reconnectAttempts++;
              const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1);
              reconnectTimer = setTimeout(() => {
                if (!destroyed) connect();
              }, delay);
            } else {
              startPolling();
            }
          },
        });
      } catch {
        if (!destroyed) startPolling();
      }
    }

    connect();

    return () => {
      destroyed = true;
      ctrl?.abort();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      stopPolling();
    };
  }, [fallbackPollingMs]);
}
