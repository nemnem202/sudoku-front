import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AppService } from '../../services/app.service';
import { GameService } from '../../services/game.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule, MatTabsModule, MatMenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  gameService = inject(GameService);
  appService = inject(AppService);
  userName: string = 'John Doe';
  userPicture: string = 'use picture';
  modeIndex: number = 0;
  cdr = inject(ChangeDetectorRef);
  constructor() {
    // this.appService.userPicture.subscribe((url) => {
    //   console.log('ne user picture', url);
    //   this.userPicture = url;
    //   this.cdr.detectChanges();
    // });
    this.appService.killer.subscribe((bool) => {
      if (bool != undefined) {
        this.modeIndex = bool ? 1 : 0;
      }
    });
  }

  ngOnInit(): void {
    this.appService.userPicture.subscribe((url) => {
      this.userPicture = url;
      this.cdr.detectChanges();
    });
  }
  redirect(bool: boolean) {
    this.gameService.redirect(bool, undefined, true);
  }
}
