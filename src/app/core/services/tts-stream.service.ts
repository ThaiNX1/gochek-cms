import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { storageKey } from '../constants/storage-key';

export interface TtsStreamResult {
  audioBlob: Blob;
  audioUrl: string;
}

@Injectable({ providedIn: 'root' })
export class TtsStreamService {

  stream(text: string, voiceId?: string): Promise<TtsStreamResult> {
    return new Promise((resolve, reject) => {
      const chunks: ArrayBuffer[] = [];
      const token = localStorage.getItem(storageKey.token) || '';

      const socket: Socket = io(environment.ttsWebsocket, {
        path: '/socket.io',
        transports: ['websocket'],
        auth: { token: `Bearer ${token}` },
      });

      socket.on('connect', () => {
        socket.emit('synthesize', { text, voiceId });
      });

      socket.on('tts-audio', (data: ArrayBuffer | Buffer) => {
        // Đảm bảo data là ArrayBuffer
        const buffer = data instanceof ArrayBuffer
          ? data
          : (data as any).buffer ?? new Uint8Array(data as any).buffer;
        chunks.push(buffer);
        console.log(`[TTS] Received chunk #${chunks.length}, size: ${buffer.byteLength} bytes`);
      });

      socket.on('tts-done', () => {
        console.log('chunks.length', chunks.length)
        socket.disconnect();
        if (chunks.length === 0) {
          reject(new Error('Không nhận được dữ liệu audio'));
          return;
        }
        const result = this.mergeChunks(chunks);
        resolve(result);
      });

      socket.on('tts-error', (payload: { message?: string }) => {
        socket.disconnect();
        reject(new Error(payload?.message ?? 'Lỗi từ AI service'));
      });

      socket.on('connect_error', (err) => {
        socket.disconnect();
        reject(new Error(`Lỗi kết nối: ${err.message}`));
      });

      socket.on('disconnect', (reason) => {
        // Nếu server disconnect bất ngờ mà chưa resolve/reject
        if (reason === 'io server disconnect' && chunks.length > 0) {
          const result = this.mergeChunks(chunks);
          resolve(result);
        }
      });
    });
  }

  private mergeChunks(chunks: ArrayBuffer[]): TtsStreamResult {
    const total = chunks.reduce((sum, c) => sum + c.byteLength, 0);
    const merged = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }
    const audioBlob = new Blob([merged], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    return { audioBlob, audioUrl };
  }

  revokeUrl(url: string) {
    URL.revokeObjectURL(url);
  }
}
