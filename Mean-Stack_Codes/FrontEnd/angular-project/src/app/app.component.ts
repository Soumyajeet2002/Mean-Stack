import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'angular-project';

  isDarkTheme = false;
  hovering = false;

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
  }

  getToggleLabel(): string {
    if (this.hovering) {
      return this.isDarkTheme
        ? 'Switch to Light Theme'
        : 'Switch to Dark Theme';
    }
    return this.isDarkTheme ? 'Dark Theme' : 'Light Theme';
  }
}
