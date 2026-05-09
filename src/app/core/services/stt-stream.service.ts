import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { storageKey } from '../constants/storage-key';

export interface SttResult {
  text: string;
  isFinal: boolean;
}

export interface SttState {
  connected: boolean;
  connecting: boolean;
  streaming: boolean;
  micGranted: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class SttStreamService {

  // Observables cho component subscribe
  readonly result$ = new Subject<SttResult>();
  readonly state$ = new Subject<SttState>();

  private socket: Socket | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  private _state: SttState = {
    connected: false,
    connecting: false,
    streaming: false,
    micGranted: false,
    error: null,
  };

  get state(): SttState {
    return { ...this._state };
  }

  get isConnected(): boolean {
    return this._state.connected;
  }

  get isStreaming(): boolean {
    return this._state.streaming;
  }

  get isMicGranted(): boolean {
    return this._state.micGranted;
  }

  // ===================== Mic =====================

  async requestMicPermission(): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      this.updateState({ micGranted: true });
      return true;
    } catch {
      this.updateState({ micGranted: false, error: 'Không thể truy cập microphone' });
      return false;
    }
  }

  // ===================== Socket =====================

  connect(): void {
    if (this.socket?.connected) return;

    this.updateState({ connecting: true, error: null });
    const token = localStorage.getItem(storageKey.token) || '';

    this.socket = io(environment.sttSocket, {
      transports: ['websocket'],
      auth: { token: `Bearer ${token}` },
    });

    this.socket.on('connect', () => {
      this.updateState({ connected: true, connecting: false, error: null });
      console.log('[STT] Socket connected');
    });

    this.socket.on('stt-result', (data: SttResult) => {
      if (data?.text) {
        this.result$.next(data);
      }
    });

    this.socket.on('stt-error', (data: { message?: string }) => {
      const error = data?.message ?? 'Lỗi từ STT service';
      this.updateState({ error });
      console.error('[STT] Error:', error);
    });

    this.socket.on('connect_error', (err) => {
      this.updateState({
        connecting: false,
        connected: false,
        error: `Lỗi kết nối: ${err.message}`,
      });
      console.error('[STT] Connect error:', err.message);
    });

    this.socket.on('disconnect', () => {
      this.updateState({ connected: false, streaming: false });
      console.log('[STT] Socket disconnected');
    });
  }

  disconnect(): void {
    this.stopStream();
    this.socket?.disconnect();
    this.socket = null;
    this.updateState({ connected: false, connecting: false });
  }

  // ===================== Audio Stream =====================

  async startStream(language: string, model: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Chưa kết nối socket');
    }
    if (!this._state.micGranted || !this.mediaStream) {
      throw new Error('Chưa cấp quyền microphone');
    }

    // Emit start-stream
    this.socket.emit('start-stream', { language, model });

    // Setup AudioWorklet để capture mic
    this.audioContext = new AudioContext({ sampleRate: 16000 });

    // Đăng ký AudioWorklet processor
    const processorCode = `
      class PcmProcessor extends AudioWorkletProcessor {
        process(inputs) {
          const input = inputs[0];
          if (input && input[0]) {
            this.port.postMessage(input[0]);
          }
          return true;
        }
      }
      registerProcessor('pcm-processor', PcmProcessor);
    `;
    const blob = new Blob([processorCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);

    await this.audioContext.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);

    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-processor');

    this.workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
      if (!this._state.streaming || !this.socket?.connected) return;
      const float32 = event.data;
      // Convert Float32 → Int16 PCM
      const int16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
        const s = Math.max(-1, Math.min(1, float32[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      this.socket!.emit('audio-chunk', int16.buffer);
    };

    this.sourceNode.connect(this.workletNode);
    this.workletNode.connect(this.audioContext.destination);

    this.updateState({ streaming: true });
    console.log('[STT] Streaming started');
  }

  stopStream(): void {
    if (this._state.streaming && this.socket?.connected) {
      this.socket.emit('stop-stream');
    }

    this.workletNode?.disconnect();
    this.workletNode = null;
    this.sourceNode?.disconnect();
    this.sourceNode = null;
    this.audioContext?.close();
    this.audioContext = null;

    this.updateState({ streaming: false });
    console.log('[STT] Streaming stopped');
  }

  // ===================== Cleanup =====================

  destroy(): void {
    this.disconnect();
    this.mediaStream?.getTracks().forEach(t => t.stop());
    this.mediaStream = null;
    this.updateState({ micGranted: false });
    this.result$.complete();
    this.state$.complete();
  }

  // ===================== Internal =====================

  private updateState(partial: Partial<SttState>): void {
    this._state = { ...this._state, ...partial };
    this.state$.next(this.state);
  }
}
