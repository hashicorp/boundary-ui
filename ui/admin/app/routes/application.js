import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { A } from '@ember/array';

/**
 * Entry route for the application.
 */
export default class ApplicationRoute extends Route {
  // =services

  @service session;
  @service confirm;
  @service router;

  // =attributes

  routeIfUnauthenticated = 'index';

  // =methods

  constructor() {
    super(...arguments);
    /**
     * If user attempts to navigate away from unsaved changes, the user is
     * asked to confirm that they would like to discard the changes.  If the
     * user chooses discard, changes on the model are rolled back and the
     * transition is retried.  If the user cancels discard, the transition is
     * aborted.
     */
    this.router.on('routeWillChange', async (transition) => {
      const fromName = transition?.from?.name;
      const toName = transition?.to?.name;
      const maybeModel = transition?.from?.attributes;
      if (fromName !== toName && maybeModel?.hasDirtyAttributes) {
        transition.abort();
        try {
          await this.confirm.confirm('abandon', { isAbandonConfirm: true });
          maybeModel?.rollbackAttributes();
          transition.retry();
        } catch (e) {
          // if user denies, do nothing
        }
      }
    });
  }

  beforeModel() {
    const theme = this.session.get('data.theme');
    this.toggleTheme(theme);
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
}
