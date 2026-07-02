import { Component, output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-picking-complete-dialog',
  imports: [RouterModule],
  templateUrl: './picking-complete-dialog.html',
})
export class PickingCompleteDialog {
  cerrar = output<void>();
}
