import Route from '@ember/routing/route';
/* eslint-disable-next-line ember/no-mixins */
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import Ember from 'ember';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { later } from '@ember/runloop';
import loading from 'ember-loading/decorator';
import { A } from '@ember/array';

/**
 * Entry route for the application.
 */
export default class ApplicationRoute extends Route.extend(
  ApplicationRouteMixin
) {
  // =services

  @service session;
  @service confirm;

  // =attributes

  routeIfUnauthenticated = 'index';

  // =methods

  beforeModel() {
    const theme = this.session.get('data.theme');
    this.toggleTheme(theme);
  }

  /**
   * After becoming authenticated, does nothing.  This overrides the default
   * behavior of the ApplicationRouteMixin, which is to redirect after auth.
   * We'll handle this redirect manually in sub routes.
   * @override
   */
  sessionAuthenticated() {
    // no op
  }

  /**
   * When the session ends, redirect to authenticate and reload the page to
   * purge any in-memory state.
   */
  async sessionInvalidated() {
    // Catch error in this transition, since it will be aborted by the
    // scope auth route when it redirects to the first auth method.
    await this.transitionTo(this.routeIfUnauthenticated).catch(() => {});
    // The Ember way of accessing globals...
    const document = getOwner(this).lookup('service:-document').documentElement;
    // defaultView === window, but without using globals directly
    const { location } = document.parentNode.defaultView;
    // Wait a beat, then reload the page...
    // This is mostly to give the deauth request a chance to fire.
    /* istanbul ignore if */
    if (!Ember.testing) later(location, location.reload, 150);
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
   * If user attempts to navigate away from unsaved changes, the user is
   * asked to confirm that they would like to discard the changes.  If the
   * user chooses discard, changes on the model are rolled back and the
   * transition is retried.  If the user cancels discard, the transition is
   * aborted.
   * @param {Transition} transition
   */
  @action
  async willTransition(transition) {
    const maybeModel = transition?.from?.attributes;
    if (maybeModel?.hasDirtyAttributes) {
      transition.abort();
      try {
        await this.confirm.confirm('abandon', { isAbandonConfirm: true });
        maybeModel?.rollbackAttributes();
        transition.retry();
      } catch (e) {
        // if user denies, do nothing
      }
    }
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
