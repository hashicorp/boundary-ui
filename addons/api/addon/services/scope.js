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
   * Initializes an instance of `Scope` with optional org and project.
   * A scope with only project is invalid and in thi scenario, project will
   * be null.
   * @param {?object} org
   * @param {?object} project
   */
  constructor(org = null, project = null) {
    if (org) this.#org = org;
    if (org && project) this.#project = project;
  }

  /**
   * Org for this scope.  Immutable.
   * @type {?object}
   */
  get org() {
    return this.#org;
  }

  /**
   * Project for this scope.
   * @type {?object}
   */
  get project() {
    return this.#project;
  }

  /**
   * Returns the JSON representation of this scope.
   * @return {?object}
   */
  toJSON() {
    const { org, project } = this;
    return { org, project };
  }
}

export { Scope };

/**
 * The scope service manages the current scope, making it available throughout
 * the Ember application.  Use `service.org` and `service.project` directly,
 * rather than interacting with the internal `scope` member.
 *
 * @example
 *  // inject the scope service
 *  import { inject as service } from '@ember/service';
 *  class MyClass {
 *    @service scope;
 *  }
 *
 *  // set an org, project, or both
 *  this.scope.org = {id: 1};
 *  this.scope.project = {id: 2};
 *
 *  // retrieve the org and/or project
 *  const org = this.scope.org;
 *  const project = this.scope.project;
 */
export default class ScopeService extends Service {
  /**
   * The currently selected scope.  This is an internal member only.
   * @type {?Scope}
   */
  @tracked scope = new Scope();

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

  // =methods

  /**
   * Resets to an empty scope.
   */
  reset() {
    this.scope = new Scope();
  }
}
