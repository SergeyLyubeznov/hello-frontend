import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastHost } from '../../../shared/components/toast-host/toast-host';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastHost],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {}
