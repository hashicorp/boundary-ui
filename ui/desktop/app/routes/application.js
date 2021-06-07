import Route from '@ember/routing/route';
import jQuery from 'jquery';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import loading from 'ember-loading/decorator';

export default class ApplicationRoute extends Route {
  // =services

  @service session;
  @service origin;
  @service ipc;

  // =attributes

  /**
   * @type {string}
   */
  routeIfUnauthenticated = 'index';

  /**
   * Check that the origin specified in the renderer matches the origin
   * reported by the main process.  If they differ, update the main process
   * origin so that the renderer's CSP can be rewritten to allow requests.
   */
  beforeModel() {
    const theme = this.session.get('data.theme');
    this.toggleTheme(theme);
    return this.origin.updateOrigin();
  }

  /**
   * Adds listener on target=_blank links so that they may be opened in an
   * external browser.
   */
  afterModel() {
    const ipc = this.ipc;
    /* eslint-disable-next-line ember/no-jquery */
    jQuery(document).on('click', 'a[href][target="_blank"]', function () {
      ipc.invoke('openExternal', this.href);
    });
  }

  /**
   * Add OS config on controller
   */
  async setupController(controller) {
    controller.set('isMacOS', await this.ipc.invoke('isMacOS'));
    controller.set('isWindowsOS', await this.ipc.invoke('isWindowsOS'));
  }

  // =actions

  /**
   * Delegates invalidation to the session service.
   */
  @action
  invalidateSession() {
    this.session.invalidate();
  }

  /**
   * Disconnects from origin and invalidates session, thereby resetting
   * the client and reloading to the onboarding origin screen.
   */
  @action
  disconnect() {
    this.origin.resetOrigin();
    this.invalidateSession();
  }

  /**
   * Hooks into ember-loading to kick off loading indicator in the
   * application template.
   * @return {boolean} always returns true
   */
  @action
  @loading
  loading() {
    return true;
  }

  /**
   * Invalidates the session if a 401 error occurs and returns false to
   * prevent further error handling.
   * Returns true in all other cases, allowing error handling to occur (such
   * as displaying the `error.hbs` template, if one exists).
   * @param {Error} e
   */
  @action
  error(e) {
    const isUnauthenticated = A(e?.errors)?.firstObject?.isUnauthenticated;
    if (isUnauthenticated) {
      this.session.invalidate();
      return false;
    }
    return true;
  }

  /**
   * Applies the specified color theme to the root ember element.
   * @param {string} theme - "light", "dark", or nullish (system default)
   */
  @action
  toggleTheme(theme) {
    const rootElementSelector = getOwner(this).rootElement;
    const rootEl = getOwner(this)
      .lookup('service:-document')
      .querySelector(rootElementSelector);
    this.session.set('data.theme', theme);
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

  @action
  minimize() {
    this.ipc.invoke('minimizeWindow');
  }

  @action
  toggleFullScreen() {
    this.ipc.invoke('toggleFullscreenWindow');
  }

  @action
  close() {
    this.ipc.invoke('closeWindow');
  }
}
