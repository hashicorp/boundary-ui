/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationAdapter from './application';

export default class StorageBucketAdapter extends ApplicationAdapter {
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
    let pluginName;
    try {
      pluginName = snapshot?.attr('plugin')?.name;
    } catch (e) {
      // Ignore any adapter errors here
    }
    if (requestType === 'createRecord' && pluginName) {
      url = `${url}?plugin_name=${pluginName}`;
    }
    return url;
  }
}
