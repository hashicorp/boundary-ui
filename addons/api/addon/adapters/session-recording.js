/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationAdapter from './application';
import { MIME_TYPE_ASCIICAST } from 'api/models/channel-recording';

export default class SessionRecordingAdapter extends ApplicationAdapter {
  /**
   * Overrides the default `buildURL` such that for custom download methods,
   * URLs will get the query parameters. All other request types behave as normal.
   *
   * @param modelName {string}
   * @param id {string}
   * @param snapshot {object}
   * @param requestType {string}
   * @param query {object}
   * @returns {string}
   */
  buildURL(modelName, id, snapshot, requestType, query) {
    let url = super.buildURL(...arguments);
    let method;
    try {
      method = snapshot?.adapterOptions?.method;
    } catch (e) {
      // Ignore any adapter errors here
    }
    if (method === 'download') {
      const queryParams = new URLSearchParams(query).toString();
      if (queryParams) url = `${url}?${queryParams}`;
    }
    return url;
  }

  /**
   * Handles the download recording for recordings. Takes in a mime type for the
   * type or recording to return.
   * The ID can be the session ID, session recording ID,
   * connection recording ID, or the channel recording ID.
   * @param id {string}
   * @param mimeType {string}
   * @returns {Promise<string>}
   */
  async getRecordingDownload({ id, mimeType }) {
    const options = { adapterOptions: { method: 'download' } };
    const url = this.buildURL('session-recording', id, options, 'findRecord', {
      mime_type: mimeType,
    });

    const response = await fetch(url, { headers: this.headers });
    if (response?.ok) {
      return response.text();
    } else {
      throw this.handleResponse(
        response.status,
        response.headers,
        await response.text(),
      );
    }
  }

  /**
   * Returns an ascii cast recording.
   * @param id
   * @returns {Promise<string>}
   */
  getAsciicast(id) {
    return this.getRecordingDownload({
      id,
      mimeType: MIME_TYPE_ASCIICAST,
    });
  }
}
