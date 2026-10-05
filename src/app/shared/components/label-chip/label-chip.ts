import { Component, input } from '@angular/core';
import { Label } from '../../../features/tasks/models/task.model';

@Component({
  selector: 'app-label-chip',
  templateUrl: './label-chip.html',
  styleUrl: './label-chip.scss',
})
export class LabelChip {
  readonly label = input.required<Label>();
}
