import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

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
   * Returns the JSON serialization of this scope.  This is necessary because
   * scopes may be persisted in storage with their JSON representation.
   * @return {?object}
   */
  toJSON() {
    const { org, project } = this;
    return { org, project };
  }
}

export { Scope };

/**
 * The scope service manages and persists the current scope.  To interact with
 * this service, get and set `service.org` or `service.project` directly, rather
 * than using the tracked `scope` member, which is internal.
 *
 * A scope is valid only if the user has access to the organization and project
 * specified in the scope, and they exist.  However, validating against
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
   * The storage service is used to persist the current scope.
   * @type {StorageService}
   */
  @service storage;

  /**
   * The currently selected scope.  This is an internal member only.
   * @type {?Scope}
   */
  @tracked scope = new Scope();

  /**
   * When setting org, `service.org = {...}`, a new scope is instantiated,
   * since scopes are immutable.  Also persists scope on set.
   * @type {?object}
   */
  @computed('scope.org')
  get org() {
    return this.scope ? this.scope.org : null;
  }
  set org(org) {
    this.scope = new Scope(org, this.project);
    this.saveScope(this.scope);
  }

  /**
   * When setting project, `service.project = {...}`, a new scope is
   * instantiated, since scopes are immutable.  Also persists scope on set.
   * @type {?object}
   */
  @computed('scope.project')
  get project() {
    return this.scope ? this.scope.project : null;
  }
  set project(project) {
    this.scope = new Scope(this.org, project);
    this.saveScope(this.scope);
  }

  /**
   * Saves the current scope into storage.
   */
  saveScope(scope) {
    this.storage.setItem('scope', scope);
  }

  /**
   * Retrieves a saved scope from storage, if any.
   * @return {?Scope}
   */
  fetchScope() {
    const json = this.storage.getItem('scope');
    if (json) return new Scope(json.org, json.project);
  }

  /**
   * Initializes the service's current scope from storage, if any.
   */
  init() {
    const savedScope = this.fetchScope();
    if (savedScope) this.scope = savedScope;
    super.init(...arguments);
  }
}
