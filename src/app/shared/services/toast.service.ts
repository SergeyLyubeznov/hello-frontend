import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, durationMs = 6000): void {
    const id = this.nextId++;
    this._toasts.update((toasts) => [...toasts, { id, message }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number): void {
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
