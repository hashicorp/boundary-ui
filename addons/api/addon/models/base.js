/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Model from '@ember-data/model';
import { attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { service } from '@ember/service';

/**
 * Base model class provides common functionality for all models.
 *
 * One of the most interesting features of most resources is the
 * `scope` field, which arrives from the API as an embedded JSON fragment.
 * It contains information such as the parent scope ID and type.  This scope ID
 * is then used when generation scoped resource URLs via the
 * `adapterOptions.scopeID` option (see `save` method below).
 *
 * For convenience, developers may interact with scope in a number of ways.
 * The simplest method, when you don't care about other information, is to set
 * the `scopeID`, e.g. `record.scopeID = 'o_123'`.  The scope JSON fragment
 * may be set directly, `record.scope = { scope_id: 'o_123' }`.
 * For convenience, you may even set the scope using a `Scope` model:
 * `record.scopeModel = scopeModelInstance`, which automatically converts the
 * scope to a JSON fragment of the proper shape and assigns it to `scope`.
 *
 * A record's scope may be read in one of two ways:
 *
 *   1) As a JSON fragment:  `record.scope`,
 *   2) Or as an ID:  `record.scopeID`.
 */
export default class BaseModel extends Model {
  // =services

  @service store;

  // =relationships

  /**
   * Scope of this resource, if any, represented as a JSON fragment.
   */
  @attr() scope;

  // =attributes

  @attr({
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  authorized_actions;

  @attr({
    readOnly: true,
  })
  authorized_collection_actions;

  get scopeModel() {
    const id = this.scopeID;
    return id ? this.store.peekRecord('scope', id) : null;
  }

  // Ember seems to have a bug with its internals and can't correctly set
  // the `scopeModel` when passed in as part of the `inputProperties`
  // of a `createRecord` call
  set scopeModel(model) {
    if (model) {
      const json = model.serialize();
      json.scope_id = model.id;
      json.type = model.type;
      json.isGlobal = model.isGlobal;
      json.isOrg = model.isOrg;
      json.isProject = model.isProject;
      this.scope = json;
    }
  }

  /**
   * Convenience for getting and setting the parent scope ID.
   * @type {string}
   */
  @computed('scope.scope_id')
  get scopeID() {
    return this?.scope?.scope_id;
  }
  set scopeID(id) {
    if (!this.scope) this.scope = {};
    this.scope.scope_id = id;
  }

  /**
   * Names are optional on models in our API.  Thus we need to fallback on ID
   * for display purposes.
   * @type {string}
   */
  @computed('name', 'id')
  get displayName() {
    return this.name || this.id;
  }

  /**
   * @type {boolean}
   */
  get canSave() {
    return this.hasDirtyAttributes && !this.isSaving;
  }

  /**
   * @type {boolean}
   */
  get cannotSave() {
    return !this.canSave;
  }
}
