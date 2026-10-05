import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Label, LabelDto } from '../models/task.model';

const API_URL = '/api/labels';

@Injectable({ providedIn: 'root' })
export class LabelsService {
  private readonly http = inject(HttpClient);

  private readonly _labels = signal<Label[]>([]);
  readonly labels = this._labels.asReadonly();

  private requested = false;

  // Names and colors rarely change, so screens that only need them (the task form)
  // fetch the list once and then reuse it. The count query is skipped (withCount=false).
  loadLabels(): void {
    if (!this.requested) {
      this.fetchLabels(false);
    }
  }

  // Always asks the backend and includes `taskCount`, so it is current. Used by the Labels page.
  refreshLabels(): void {
    this.fetchLabels(true);
  }

  private fetchLabels(withCount: boolean): void {
    this.requested = true;
    this.http.get<Label[]>(API_URL, { params: { withCount } }).subscribe({
      next: (labels) => this._labels.set(labels),
      error: (err) => {
        this.requested = false;
        console.error('Failed to load labels', err);
      },
    });
  }

  createLabel(dto: LabelDto): Observable<Label> {
    return this.http
      .post<Label>(API_URL, dto)
      .pipe(tap((label) => this._labels.update((labels) => [...labels, label])));
  }

  updateLabel(id: number, dto: LabelDto): Observable<Label> {
    return this.http
      .put<Label>(`${API_URL}/${id}`, dto)
      .pipe(
        tap((updated) =>
          this._labels.update((labels) =>
            labels.map((label) => (label.id === id ? updated : label)),
          ),
        ),
      );
  }

  deleteLabel(id: number): Observable<void> {
    return this.http
      .delete<void>(`${API_URL}/${id}`)
      .pipe(tap(() => this._labels.update((labels) => labels.filter((label) => label.id !== id))));
  }
}
