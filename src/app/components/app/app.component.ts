import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { AuthConfig } from 'angular-oauth2-oidc';
import { AppService } from '../../services/app.service';
import { HeaderComponent } from '../header/header.component';
import { GridComponent } from '../grid/grid.component';
import { ControlsComponent } from '../controls/controls.component';
import { GameService } from '../../services/game.service';
import { DifficultyComponent } from '../difficulty/difficulty.component';

const authConfig: AuthConfig = {
  issuer: 'https://accounts.google.com',
  redirectUri: window.location.origin,
  strictDiscoveryDocumentValidation: false,
  clientId:
    '353837259470-hoi5ad3irodledbc4v31gehaij7k844p.apps.googleusercontent.com',
  scope: 'openid profile',
  responseType: 'token id_token',
  showDebugInformation: true,
  useSilentRefresh: false,
};

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    ControlsComponent,
    GridComponent,
    DifficultyComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'front';
  private oauthService = inject(OAuthService);
  private appService = inject(AppService);
  private gameService = inject(GameService);

  constructor() {
    this.oauthService.configure(authConfig);
    this.appService.initAuthFlow();
  }

  ngOnInit(): void {
    this.gameService.redirect(undefined, undefined, true);
  }
}
