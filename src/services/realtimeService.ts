/**
 * Realtime Notification and Live Order Status Client
 * Connects to the Express backend SSE (Server-Sent Events) live stream
 * Synchronizes: Customer App <-> Backend API <-> Store Dashboard <-> Rider App
 */

import { getApiBaseUrl } from '../config/api';

export type RealtimeEventType = 
  | 'CONNECTED'
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'RIDER_ASSIGNED'
  | 'DELIVERY_STATUS_CHANGED'
  | 'RIDER_LOCATION_UPDATED';

export interface RealtimeMessage {
  type: RealtimeEventType;
  payload: any;
  timestamp: string;
}

type EventCallback = (message: RealtimeMessage) => void;

class RealtimeClient {
  private eventSource: EventSource | null = null;
  private listeners: Set<EventCallback> = new Set();
  private isConnected: boolean = false;
  private reconnectTimer: any = null;

  constructor() {
    this.connect();
  }

  public connect(role: string = 'customer', userId?: string): void {
    if (typeof window === 'undefined') return;

    if (this.eventSource) {
      this.eventSource.close();
    }

    try {
      const baseUrl = getApiBaseUrl();
      // Replace /api suffix if present to hit root notification stream
      const streamUrl = `${baseUrl}/notifications/stream?role=${role}${userId ? `&userId=${userId}` : ''}`;

      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => {
        this.isConnected = true;
        console.log('⚡ Realtime stream connected to backend');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data: RealtimeMessage = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (err) {
          // Heartbeat or non-json message
        }
      };

      this.eventSource.onerror = (err) => {
        this.isConnected = false;
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }

        // Retry connection after 5 seconds
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect(role, userId);
          }, 5000);
        }
      };
    } catch (e) {
      console.warn('Realtime connection initialisation failed:', e);
    }
  }

  public subscribe(callback: EventCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(message: RealtimeMessage): void {
    this.listeners.forEach((callback) => {
      try {
        callback(message);
      } catch (err) {
        console.error('Error in realtime listener callback:', err);
      }
    });
  }

  public getStatus(): boolean {
    return this.isConnected;
  }
}

export const realtimeService = new RealtimeClient();
