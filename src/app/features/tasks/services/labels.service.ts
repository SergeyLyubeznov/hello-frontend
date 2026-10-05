import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Label } from '../models/task.model';

const API_URL = '/api/labels';

@Injectable({ providedIn: 'root' })
export class LabelsService {
  private readonly http = inject(HttpClient);

  private readonly _labels = signal<Label[]>([]);
  readonly labels = this._labels.asReadonly();

  private requested = false;

  // The label list rarely changes, so it is fetched once and then reused.
  loadLabels(): void {
    if (this.requested) {
      return;
    }

    this.requested = true;
    this.http.get<Label[]>(API_URL).subscribe({
      next: (labels) => this._labels.set(labels),
      error: (err) => {
        this.requested = false;
        console.error('Failed to load labels', err);
      },
    });
  }
}
