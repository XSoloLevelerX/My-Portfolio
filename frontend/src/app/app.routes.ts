import { Routes } from '@angular/router';

/**
 * Every page is lazily loaded, so the first paint ships the home route and
 * nothing else. Previously these were plain hrefs, which meant each nav click
 * was a full page reload — the whole bundle again, and the intro replayed.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.Home),
    title: 'Amartya — Learn. Build. Inspire.',
  },
  {
    path: 'projects',
    loadComponent: () => import('./features/projects/projects').then(m => m.Projects),
    title: 'Projects — Amartya',
  },
  {
    path: 'skills',
    loadComponent: () => import('./features/skills/skills').then(m => m.Skills),
    title: 'Skills — Amartya',
  },
  {
    path: 'certifications',
    loadComponent: () =>
      import('./features/certifications/certifications').then(m => m.Certifications),
    title: 'Certifications — Amartya',
  },
  {
    path: 'blog',
    loadComponent: () => import('./features/blog/blog').then(m => m.Blog),
    title: 'Blog — Amartya',
  },
  {
    path: 'extracurricular',
    loadComponent: () =>
      import('./features/extracurricular/extracurricular').then(m => m.Extracurricular),
    title: 'Extracurricular — Amartya',
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then(m => m.About),
    title: 'About — Amartya',
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact').then(m => m.Contact),
    title: 'Contact — Amartya',
  },
  { path: '**', redirectTo: '' },
];
