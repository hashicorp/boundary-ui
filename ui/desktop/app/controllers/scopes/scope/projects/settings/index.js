import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';

const THEMES = [
  {
    label: 'system',
    value: 'system-default-theme',
  },
  {
    label: 'light',
    value: 'light',
  },
  {
    label: 'dark',
    value: 'dark',
  },
];

export default class ScopesScopeProjectsSettingsIndexController extends Controller {
  @service session;
  @service ipc;
  // Methods

  /**
   * Returns available themes
   */
  get themes() {
    return THEMES;
  }

  /**
   * Applies the specified color theme to the root ember element.
   * @param {string} theme - "light", "dark", or nullish (system default)
   */
  @action
  async toggleTheme({ target: { value: theme } }) {
    const rootElementSelector = getOwner(this).rootElement;
    const rootEl = getOwner(this)
      .lookup('service:-document')
      .querySelector(rootElementSelector);
    this.session.set('data.theme', theme);
    console.log(this.session.data.theme, 'theeeee')
    switch (theme) {
      case 'light':
        rootEl.classList.add('rose-theme-light');
        rootEl.classList.remove('rose-theme-dark');
        break;
      case 'dark':
        rootEl.classList.add('rose-theme-dark');
        rootEl.classList.remove('rose-theme-light');
        break;
      default:
        rootEl.classList.remove('rose-theme-dark');
        rootEl.classList.remove('rose-theme-light');
    }
  }
}
