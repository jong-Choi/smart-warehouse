// BroadcastChannel API를 사용한 웹소켓 유사 인터페이스
// 나중에 실제 웹소켓으로 쉽게 교체할 수 있도록 동일한 인터페이스 제공

import type {
  BroadcastMessage,
  BroadcastChannelInterface,
} from "@/types/broadcast";

class BroadcastChannelManager implements BroadcastChannelInterface {
  private channel: BroadcastChannel;
  private handlers: ((data: BroadcastMessage) => void)[] = [];
  private isConnected = false;
  private senderId: string; // 고정된 발신자 ID

  constructor(channelName: string = "warehouse-events") {
    this.channel = new BroadcastChannel(channelName);
    this.senderId = this.generateSenderId(); // 생성자에서 한 번만 생성
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
    // 고유한 발신자 ID 생성 (탭 ID + 타임스탬프)
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  send(data: BroadcastMessage): void {
    if (!this.isConnected) {
      console.warn("BroadcastChannel is not connected");
      return;
    }

    try {
      // 발신자 ID 추가
      const messageWithSender = {
        ...data,
        senderId: this.senderId,
        timestamp: Date.now(),
      };

      this.channel.postMessage(messageWithSender);
    } catch (error) {
      console.error("Failed to send message via BroadcastChannel:", error);
    }
  }

  subscribe(handler: (data: BroadcastMessage) => void): () => void {
    this.handlers.push(handler);

    // 구독 해제 함수 반환
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  disconnect(): void {
    if (this.isConnected) {
      this.channel.close();
      this.handlers = [];
      this.isConnected = false;
    }
  }
}

// 인스턴스 캐시 (채널명별로)
const channelInstances = new Map<string, BroadcastChannelManager>();
const localEventInstances = new Map<string, LocalEventManager>();

export function createBroadcastChannel(
  channelName: string = "warehouse-events"
): BroadcastChannelInterface {
  if (!channelInstances.has(channelName)) {
    channelInstances.set(channelName, new BroadcastChannelManager(channelName));
  }
  return channelInstances.get(channelName)!;
}

export function createLocalEventManager(
  channelName: string = "warehouse-events"
): BroadcastChannelInterface {
  if (!localEventInstances.has(channelName)) {
    localEventInstances.set(channelName, new LocalEventManager());
  }
  return localEventInstances.get(channelName)!;
}

export function getBroadcastChannel(
  channelName: string = "warehouse-events"
): BroadcastChannelInterface {
  return createBroadcastChannel(channelName);
}

// BroadcastChannel 지원 여부 확인
export function isBroadcastChannelSupported(): boolean {
  return typeof BroadcastChannel !== "undefined";
}

// 폴백을 위한 로컬 이벤트 시스템 (BroadcastChannel을 지원하지 않는 경우)
class LocalEventManager implements BroadcastChannelInterface {
  private handlers: ((data: BroadcastMessage) => void)[] = [];
  private isConnected = false;
  private senderId: string; // 고정된 발신자 ID

  constructor() {
    this.isConnected = true;
    this.senderId = this.generateSenderId();
  }

  private generateSenderId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  send(data: BroadcastMessage): void {
    if (!this.isConnected) {
      console.warn("LocalEventManager is not connected");
      return;
    }

    // 발신자 ID 추가
    const messageWithSender = {
      ...data,
      senderId: this.senderId,
      timestamp: Date.now(),
    };

    // 즉시 모든 핸들러에게 전달 (동기적으로)
    this.handlers.forEach((handler) => {
      try {
        handler(messageWithSender);
      } catch (error) {
        console.error("LocalEventManager handler error:", error);
      }
    });
  }

  subscribe(handler: (data: BroadcastMessage) => void): () => void {
    this.handlers.push(handler);

    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  disconnect(): void {
    this.handlers = [];
    this.isConnected = false;
  }
}

// 브라우저 지원 여부에 따라 적절한 구현체 반환
export function createChannelInterface(
  channelName: string = "warehouse-events"
): BroadcastChannelInterface {
  // 개발 중에는 LocalEventManager를 사용 (같은 탭에서 테스트하기 위해)
  // 실제 배포 시에는 BroadcastChannel 사용
  const useLocalEvents = process.env.NODE_ENV === "development";

  if (isBroadcastChannelSupported() && !useLocalEvents) {
    return createBroadcastChannel(channelName);
  } else {
    return createLocalEventManager(channelName);
  }
}
