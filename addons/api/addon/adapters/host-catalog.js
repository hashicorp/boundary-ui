/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationAdapter from './application';

export default class HostCatalogAdapter extends ApplicationAdapter {
  /**
   * Overrides the default `buildURL` such that on _create_, URLs for records of
   * type `plugin` get an extra query parameter `?plugin_name`.  All other
   * request types behave as normal.
   *
   * @override
   * @param {string} modelName
   * @param {string} id
   * @return {string} url
   * @return {string} requestType
   */
  buildURL(modelName, id, snapshot, requestType) {
    let url = super.buildURL(...arguments);
    if (requestType === 'createRecord') {
      try {
        const pluginName = snapshot.attr('plugin')?.name;
        if (pluginName) url = `${url}?plugin_name=${pluginName}`;
      } catch (e) {
        // Ignore any adapter errors here
      }
    }
    return url;
  }
}
