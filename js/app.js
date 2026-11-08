// App entry point: loads content + saved profile, then routes between screens.
// Routes live in the URL hash, e.g. #/home, #/library, #/exercise/push-up, #/player/hiit-starter?min=30

import { loadContent } from './content.js';
import { kvGet, kvSet } from './db.js';
import { setAudioPrefs } from './audio.js';
import { html, render } from './ui.js';
import * as onboarding from './screens/onboarding.js';
import * as home from './screens/home.js';
import * as library from './screens/library.js';
import * as history from './screens/history.js';
import * as me from './screens/settings.js';
import * as player from './screens/player.js';

export const APP_VERSION = '2026.11.08.2';

const SCREENS = {
  onboarding: { mount: onboarding.mount, nav: false },
  home: { mount: home.mount, nav: true, tab: 'home' },
  library: { mount: library.mount, nav: true, tab: 'library' },
  exercise: { mount: library.mountDetail, nav: true, tab: 'library' },
  history: { mount: history.mount, nav: true, tab: 'history' },
  me: { mount: me.mount, nav: true, tab: 'me' },
  player: { mount: player.mount, nav: false },
};

// Shared state every screen receives.
const app = {
  version: APP_VERSION,
  content: null,
  profile: null,
  prefs: { sound: true, voice: true },
  async saveProfile(p) { this.profile = p; await kvSet('profile', p); },
  async savePrefs(p) { this.prefs = { ...this.prefs, ...p }; setAudioPrefs(this.prefs); await kvSet('prefs', this.prefs); },
  go(path) { location.hash = '#/' + path; },
};

const main = document.getElementById('main');
let cleanup = null;

async function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const [path, qs] = hash.split('?');
  let [name, arg] = path.split('/');
  if (!app.profile && name !== 'onboarding') name = 'onboarding';
  if (!SCREENS[name]) name = 'home';
  const screen = SCREENS[name];

  if (typeof cleanup === 'function') cleanup();
  cleanup = null;
  document.body.classList.toggle('no-nav', !screen.nav);
  document.body.dataset.level = app.profile?.level || 'juvenile'; // drives the level accent color
  document.querySelectorAll('.tabbar a').forEach((a) => a.classList.toggle('active', a.dataset.tab === screen.tab));
  main.innerHTML = '';
  window.scrollTo(0, 0);
  try {
    cleanup = await screen.mount(main, { app, arg: arg && decodeURIComponent(arg), query: new URLSearchParams(qs || '') });
  } catch (err) {
    console.error(err);
    render(main, html`<div class="card"><h2>Something went wrong</h2><p class="muted">${err.message}</p><a class="btn" href="#/home">Back to home</a></div>`);
  }
}

async function boot() {
  try {
    app.content = await loadContent();
    app.profile = (await kvGet('profile')) || null;
    app.prefs = { ...app.prefs, ...((await kvGet('prefs')) || {}) };
    setAudioPrefs(app.prefs);
  } catch (err) {
    render(main, html`<div class="card"><h2>Couldn't start Grauer</h2><p class="muted">${err.message}</p></div>`);
    return;
  }
  window.addEventListener('hashchange', route);
  route();

  // Offline support. (Fails harmlessly in some preview browsers.)
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch((e) => console.info('Service worker not registered:', e.message));
  }
}

boot();
