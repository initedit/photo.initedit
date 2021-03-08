import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) { }

  toast(msg: string) {
    this.snackBar.open(msg, null, {
      duration: 2000,
      panelClass: ['text-center', 'ui-toast-center'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    })
  }
}
