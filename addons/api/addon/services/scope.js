import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';

/**
 * This module includes two parts:
 *
 *   - `Scope` class:  a data structure representing an org/project tuple
 *   - `ScopeService`:  manages the scope and exposes it to the application
 */

/**
 * Represents a _scope_, which is defined as an organization/project tuple.
 * This class is intended as a simple data structure and is used by the
 * scope service (see below).
 * Immutable.
 */
class Scope {
  /**
   * @type {?object}
   * @private
   */
  #org = null;

  /**
   * @type {?object}
   * @private
   */
  #project = null;

  /**
   * Initializes an instance of `Scope` with optional org and/or project.
   * @param {?object} org
   * @param {?object} project
   */
  constructor(org = null, project = null) {
    if (org) this.#org = org;
    if (project) this.#project = project;
  }

  /**
   * Org for this scope.  Immutable.
   * @type {?object}
   */
  get org() {
    return this.#org;
  }

  /**
   * Project for this scope.  If org is null, so is project.
   * @type {?object}
   */
  get project() {
    return this.org ? this.#project : null;
  }

  /**
   * Returns the JSON serialization of this scope.
   * @return {?object}
   */
  toJSON() {
    const { org, project } = this;
    return JSON.stringify({ org, project });
  }
}

export { Scope };

/**
 * The scope service manages and persists the current scope.  Validating against
 * available organizations and projects is outside the scope (tee hee) of this
 * service because it is used by the adapter mixin to generate API paths, which
 * could lead to problems were this service to attempt to fetch data.
 *
 * For now, should an invalid scope arise, it is left to the user to refresh,
 * since they are likely to encounter 404s.  This is an acceptable tradeoff for
 * an initial release because invalid scopes are considered uncommon.
 */
export default class ScopeService extends Service {
  /**
   * The currently selected scope.
   * @type {?Scope}
   */
  @tracked scope = null;

  /**
   * When setting org, `service.org = {...}`, a new scope is instantiated,
   * since scopes are immutable.
   * @type {?object}
   */
  @computed('scope.org')
  get org() {
    return this.scope ? this.scope.org : null;
  }
  set org(org) {
    this.scope = new Scope(org, this.project);
  }

  /**
   * When setting project, `service.project = {...}`, a new scope is
   * instantiated, since scopes are immutable.
   * @type {?object}
   */
  @computed('scope.project')
  get project() {
    return this.scope ? this.scope.project : null;
  }
  set project(project) {
    this.scope = new Scope(this.org, project);
  }
}
