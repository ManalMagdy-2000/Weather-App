import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private snackBar: MatSnackBar) {}

  showSuccess(msg: string): void {
    this.showNotification(msg, 'success-snackbar');
  }

  showError(msg: string): void {
    this.showNotification(msg, 'error-snackbar');
  }

  private showNotification(msg: string, panelClass: string): void {
    const config: MatSnackBarConfig = {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [panelClass],
    };

    this.snackBar.open(msg, '', config);
  }
}
