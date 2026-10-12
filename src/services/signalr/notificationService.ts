import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import type { HubConnection } from "@microsoft/signalr";
import { AUTH_COOKIE_NAMES, getCookie } from "../../utils/cookies";

const SIGNALR_URL =
  import.meta.env.VITE_SIGNALR_URL ??
  `${import.meta.env.VITE_API_URL}/../hubs/notifications`;

class NotificationService {
  private connection: HubConnection | null = null;
  private startPromise: Promise<void> | null = null;
  private disconnectTimeout: number | null = null;

  private createConnection(): HubConnection {
    if (!this.connection) {
      this.connection = new HubConnectionBuilder()
        .withUrl(SIGNALR_URL, {
          accessTokenFactory: () =>
            getCookie(AUTH_COOKIE_NAMES.accessToken) ?? "",
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(LogLevel.Warning)
        .build();
    }

    return this.connection;
  }

  connect(): Promise<void> {
    if (this.disconnectTimeout !== null) {
      window.clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = null;
    }

    const connection = this.createConnection();

    if (
      connection.state === HubConnectionState.Connected ||
      connection.state === HubConnectionState.Reconnecting
    ) {
      return Promise.resolve();
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    if (connection.state === HubConnectionState.Connecting) {
      return Promise.resolve();
    }

    this.startPromise = connection
      .start()
      .finally(() => {
        this.startPromise = null;
      });

    return this.startPromise;
  }

  disconnect(): void {
    if (this.disconnectTimeout !== null) {
      window.clearTimeout(this.disconnectTimeout);
    }

    this.disconnectTimeout = window.setTimeout(() => {
      this.disconnectTimeout = null;
      const connection = this.connection;

      if (
        connection &&
        connection.state !== HubConnectionState.Disconnected
      ) {
        void connection.stop().catch((error: unknown) => {
          console.error(
            "Notification connection shutdown error:",
            error,
          );
        });
      }
    }, 0);
  }

  on<T>(eventName: string, handler: (data: T) => void): void {
    this.createConnection().on(eventName, handler);
  }

  off<T>(eventName: string, handler: (data: T) => void): void {
    this.connection?.off(eventName, handler);
  }

  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }
}

export const notificationService = new NotificationService();
