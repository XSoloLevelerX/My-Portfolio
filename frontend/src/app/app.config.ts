import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter, withDisabledInitialNavigation, withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Cross-route fades, and every page starts at the top rather than
      // inheriting the previous route's scroll position.
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      // Nothing routes — and so nothing loads or fetches — until a profile is
      // chosen. Without this the home route resolves during the title sequence
      // and its data is already on the wire before anyone has picked anything.
      withDisabledInitialNavigation(),
    ),
    provideHttpClient(withFetch())
  ]
};
