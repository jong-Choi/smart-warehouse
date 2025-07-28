import type {
  BroadcastMessage,
  BroadcastChannelInterface,
} from "@/types/broadcast";

class ExtendedBroadcastChannel implements BroadcastChannelInterface {
  private channel: BroadcastChannel;
  private handlers: ((data: BroadcastMessage) => void)[] = [];
  private isConnected = false;
  private senderId: string;
  private localHandlers: ((data: BroadcastMessage) => void)[] = []; // 같은 탭 내 핸들러

  constructor(channelName: string = "warehouse-events") {
    this.channel = new BroadcastChannel(channelName);
    this.senderId = this.generateSenderId();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.channel.onmessage = (event) => {
      const data = event.data as BroadcastMessage;

      // 자신이 보낸 메시지는 무시 (자기 자신에게는 전송하지 않음)
      if (data.senderId === this.senderId) {
        return;
      }

      // 모든 핸들러에게 메시지 전달
      this.handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error("BroadcastChannel handler error:", error);
        }
      });
    };

    this.channel.onmessageerror = (error) => {
      console.error("BroadcastChannel message error:", error);
    };

    this.isConnected = true;
  }

  private generateSenderId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  send(data: BroadcastMessage): void {
    if (!this.isConnected) {
      console.warn("BroadcastChannel is not connected");
      return;
    }

    try {
      const messageWithSender = {
        ...data,
        senderId: this.senderId,
        timestamp: Date.now(),
      };

      // BroadcastChannel로 다른 탭에 전송
      this.channel.postMessage(messageWithSender);

      // 같은 탭 내 핸들러들에게도 즉시 전달
      this.localHandlers.forEach((handler) => {
        try {
          handler(messageWithSender);
        } catch (error) {
          console.error("Local handler error:", error);
        }
      });
    } catch (error) {
      console.error("Failed to send message via BroadcastChannel:", error);
    }
  }

  subscribe(handler: (data: BroadcastMessage) => void): () => void {
    this.handlers.push(handler);
    this.localHandlers.push(handler);

    // 구독 해제 함수 반환
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
      this.localHandlers = this.localHandlers.filter((h) => h !== handler);
    };
  }

  disconnect(): void {
    if (this.isConnected) {
      this.channel.close();
      this.handlers = [];
      this.localHandlers = [];
      this.isConnected = false;
    }
  }
}

const channelInstances = new Map<string, ExtendedBroadcastChannel>();

export function createBroadcastChannel(
  channelName: string = "warehouse-events"
): BroadcastChannelInterface {
  if (!channelInstances.has(channelName)) {
    channelInstances.set(
      channelName,
      new ExtendedBroadcastChannel(channelName)
    );
  }
  return channelInstances.get(channelName)!;
}

export function getBroadcastChannel(
  channelName: string = "warehouse-events"
): BroadcastChannelInterface {
  return createBroadcastChannel(channelName);
}

export function createChannelInterface(
  channelName: string = "warehouse-events"
): BroadcastChannelInterface {
  return createBroadcastChannel(channelName);
}
