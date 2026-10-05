import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-in-development',
  imports: [RouterLink],
  templateUrl: './in-development.html',
  styleUrl: './in-development.scss',
})
export class InDevelopment {
  readonly title = input.required<string>();
}
