/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/**
 * Allows development-time toggling of resource permissions via the window
 * querystring.  Pass a JSON object into the query to toggle permissions.
 * Note that the value must be a valid JSON object in order to be parsed.
 *
 * @example
 *   ?authorized_actions={"account": ["read"]}
 *
 * Within a Mirage factory, pass the actions into the mock:
 *
 * @example
 *   import { Factory } from 'miragejs';
 *   import permissions from '../helpers/permissions';
 *
 *   export default Factory.extend({
 *     authorized_actions: () =>
 *       permissions.authorizedActionsFor('account') ||
 *       ['no-op', 'read', 'update', 'delete']
 *   });
 */
class ToggledCapabilities {
  // =attributes

  // Get the query string and drop the leading '?'
  #rawQuery = window.location.search.substring(1);

  // Split the querystring into key/value pairs
  #queryPairs = this.#rawQuery.split('&').map((item) => item.split('='));

  // Find the value of a pair with key `authorized_actions`
  // Safe-ish when the item is not present
  #rawAuthorizedActions = (this.#queryPairs.find(
    (item) => item[0] === 'authorized_actions',
  ) || [])[1];

  // Safe-ish when the value is not present
  #authorizedActions =
    JSON.parse(
      decodeURIComponent(this.#rawAuthorizedActions || '') || 'null',
    ) || {};

  // =methods

  /**
   * Returns authorized actions for the specified field, if any are defined
   * in the `authorized_actions` query.  Returns undefined otherwise.
   * @return {?string[]}
   */
  authorizedActionsFor(field) {
    if (this.#authorizedActions[field]) {
      return structuredClone(this.#authorizedActions[field]);
    }
  }
}

export default new ToggledCapabilities();
