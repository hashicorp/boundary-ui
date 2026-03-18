/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';

export default class GrantsSchemaService extends Service {
  // =attributes

  /**
   * @type {object|null}
   */
  @tracked data = null;

  /**
   * Used to track if the grant schema has been loaded.
   * @type {boolean}
   */
  @tracked isLoaded = false;

  /**
   * Stores the most recent load error, if any.
   * @type {Error|null}
   */
  @tracked loadError = null;

  // =methods

  /**
   * Fetches the grant schema from `/grants-schema.json`.
   * Uses the application adapter's host for the base URL.
   * Sets isLoaded to true so subsequent calls return immediately.
   * Returns `true` when the schema is loaded successfully.
   * Returns `false` when the request fails, allowing routes to continue.
   * @returns {Promise<boolean>}
   */
  async load() {
    if (this.isLoaded) return true;

    const adapter = getOwner(this).lookup('adapter:application');
    const { host } = adapter;
    const url = `${host}/grants-schema.json`;

    try {
      const response = await fetch(url);
      const json = await response.json();

      this.data = json;
      this.isLoaded = true;
      this.loadError = null;

      return true;
    } catch (error) {
      this.data = null;
      this.isLoaded = false;
      this.loadError = error;

      return false;
    }
  }

  /**
   * Finds a resource type entry from the grant schema by type name.
   * @param {string} type - The resource type to look up (e.g., "target", "credential-library")
   * @returns {object|undefined} The matching resource type object, or undefined if not found
   */
  findResourceType(type) {
    return this.data?.resource_types?.find((rt) => rt.type === type);
  }

  /**
   * Returns all available resource type names (excluding special types like "*" and "unknown").
   * @returns {string[]} Array of resource type names
   */
  getResourceTypeNames() {
    if (!this.data?.resource_types) return [];
    return this.data.resource_types
      .filter((rt) => rt.type !== '*' && rt.type !== 'unknown')
      .map((rt) => rt.type);
  }
}
