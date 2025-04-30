import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private oauthService = inject(OAuthService);
  constructor() {}

  killer = new BehaviorSubject<boolean | undefined>(undefined);
  difficulty = new BehaviorSubject<number | undefined>(undefined);
  userId = new BehaviorSubject<string | undefined>(undefined);
  sessionToken = new BehaviorSubject<string | undefined>(undefined);
  userPicture = new BehaviorSubject<string>('img url');
  userName = new BehaviorSubject<string>('John Doe');

  async initAuthFlow() {
    try {
      await this.oauthService.loadDiscoveryDocument();
      await this.oauthService.tryLoginImplicitFlow();

      if (!this.oauthService.hasValidAccessToken()) {
        await this.oauthService.initLoginFlow();
      } else {
        const userProfile = (await this.oauthService.loadUserProfile()) as {
          info: {
            picture?: string;
            name?: string;
          };
        };

        this.userPicture.next(userProfile.info?.picture || '');
        this.userName.next(userProfile.info?.name || '');
        await this.getUserId();
      }
    } catch (error) {
      console.error('Authentication failed', error);
    }
  }

  async getUserId(): Promise<string> {
    const id_token = sessionStorage.getItem('id_token');
    try {
      const res = await fetch('http://localhost:3000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: id_token,
        }),
      });

      if (!res.ok) return 'Error occurred while getting user ID from server';
      const responseBody = await res.json();
      if (!responseBody.userId) return 'cannot get user ID in server';
      if (!responseBody.token) return 'cannot get sessionToken in server';
      sessionStorage.setItem('user_id', responseBody.userId);
      this.userId.next(responseBody.userId);
      this.sessionToken.next(responseBody.token);
      return JSON.stringify(responseBody);
    } catch (error) {
      console.log(error);
      return JSON.stringify(error);
    }
  }
}
