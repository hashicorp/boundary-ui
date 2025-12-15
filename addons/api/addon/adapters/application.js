/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import RESTAdapter from '@ember-data/adapter/rest';
import { serializeIntoHash } from '@ember-data/adapter/-private';
/* eslint-disable-next-line ember/no-mixins */
import AdapterBuildURLMixin from '../mixins/adapter-build-url';
import { getOwner } from '@ember/application';
import { get } from '@ember/object';
import { InvalidError } from '@ember-data/adapter/error';
import { dasherize } from '@ember/string';
import { pluralize } from 'ember-inflector';
import { isArray } from '@ember/array';

/**
 * Returns true if the payload is an empty object, false otherwise.
 * Taken from Ember Data fetch-manager and "positivized" the name.
 * @param {object} adapterPayload
 * @return {boolean}
 */
function payloadIsBlank(adapterPayload) {
  if (Array.isArray(adapterPayload)) {
    return false;
  } else {
    return Object.keys(adapterPayload || {}).length === 0;
  }
}

/**
 * If the resonse is empty, returns a new payload containing an empty `items`
 * array, as expected by the serializer.  Otherwise, returns the response.
 *
 * Normally this would be performed 100% inside the serializer.
 * However, the fetch manager, which we cannot easily override, glues the
 * adapter and serializers together.  Before it forwards a response from the
 * adapter on to the serializer, it checks for an "empty" response.  If the
 * response is empty, fetch manager throws and error and never forwards it on.
 * @param {object} response
 * @return {object}
 */
function prenormalizeArrayResponse(response) {
  return payloadIsBlank(response) ? { items: [] } : response;
}

export default class ApplicationAdapter extends RESTAdapter.extend(
  AdapterBuildURLMixin,
) {
  // =attributes

  #host;
  #namespace;

  /**
   * Sets host to the `api.host` string in the application's config,
   * if set.
   * @type {string}
   */
  get host() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return this.#host || get(config, 'api.host');
  }
  set host(value) {
    // Setting this value is useful for testing purposes.
    this.#host = value;
  }

  /**
   * Sets namespace to the `api.namespace` string in the application's config,
   * if set.
   * @type {string}
   */
  get namespace() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return this.#namespace || get(config, 'api.namespace');
  }
  set namespace(value) {
    // Setting this value is useful for testing purposes.
    this.#namespace = value;
  }

  // =methods

  /**
   * Appends a custom method after a colon, if a method is passed via the
   * snapshot's `adapterOptions.method` field.
   * @param {string} modelName
   * @param {string} id
   * @param {object} snapshot
   * @return {string}
   */
  urlSuffix(modelName, id, snapshot = {}) {
    const method = get(snapshot, 'adapterOptions.method') || '';
    return method ? `:${method}` : '';
  }

  /**
   * Transforms the type to a dasherized string used in our API paths.
   *
   * @override
   * @param {string} type
   * @return {string}
   */
  pathForType(type) {
    return dasherize(pluralize(type));
  }

  /**
   * Intercepts "empty" responses and adds an empty `items` array.
   * This query method now supports pagination by checking the responseType and
   * passing in the list token if the responseType indicates more data
   * @override
   * @method query
   * @return {Promise} promise
   */
  async query(store, schema, query) {
    const { batchLimit, ...queryObject } = query;
    let result;
    let data = [];

    // If the query has a page_size, we skip the pagination logic
    // and return the initial result. This is being used to determine
    // if the controller supports pagination
    if (query.page_size) {
      result = await super.query(store, schema, query);
      return prenormalizeArrayResponse(result);
    }

    // Run this loop as long as the response_type is delta,
    // which indicates that there are more items in the list
    // or the batch size has not been reached
    do {
      result = await super.query(store, schema, queryObject);
      //add the result items to a data array
      if (result && result.items) {
        data.push(...result.items);
        //pass in the list token for subsequent calls to fetch the remaining list items
        queryObject.list_token = result.list_token;
      }
    } while (
      result?.response_type === 'delta' &&
      (!batchLimit || data.length < batchLimit)
    );

    result.items = data;
    return prenormalizeArrayResponse(result);
  }

  /**
   * Our API expects update calls with a custom method suffix
   * (e.g. `:set-grants`) to be made with POST instead of PUT/PATCH.
   * If this method is called with a custom method via `adapterOptions.method`,
   * the API request will be made with POST.  All other update requests are
   * made as normal.
   * @override
   * @param {Store} store
   * @param {Model} type
   * @param {Snapshot} snapshot
   * @return {Promise} promise
   */
  updateRecord(store, type, snapshot) {
    const method = get(snapshot, 'adapterOptions.method');
    const data = serializeIntoHash(store, type, snapshot, {});
    const id = snapshot.id;
    const url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');
    return this.ajax(url, method ? 'POST' : 'PUT', { data });
  }

  /**
   * Overrides default ajax method by rewriting PUT requests as PATCH.
   * PATCH is the request method used by our API for updates.
   *
   * @override
   * @method ajax
   * @private
   * @param {String} url
   * @param {String} type The request type GET, POST, PUT, DELETE etc.
   * @param {Object} options
   * @return {Promise} promise
   */
  ajax(url, type, options) {
    const method = type === 'PUT' ? 'PATCH' : type;
    return super.ajax(url, method, options);
  }

  /**
   * Our API represents invalid requests via the 400 error.  But Ember Data
   * expects 422 by default.  We change it here.
   *
   * @override
   * @method isInvalid
   * @param  {Number} status
   * @param  {Object} headers
   * @param  {Object} payload
   * @return {Boolean}
   */
  isInvalid(status /*, headers, payload*/) {
    return status === 400;
  }

  /**
   * Ember Data blatantly assumes errors always present under an `errors` key
   * in the payload, even _before normalizing errors_.  Bizarre.  Instead,
   * we pass the payload through an adapter-level transformation step if the
   * request was invalid.  Then we can rely on the serializer's `extractErrors`
   * to handle the rest.
   *
   * @override
   * @method handleResponse
   * @param  {Number} status
   * @param  {Object} headers
   * @param  {Object} payload
   * @param  {Object} requestData - the original request information
   * @return {Object | AdapterError} response
   */
  handleResponse(status, headers, payload, requestData) {
    if (this.isInvalid(status, headers, payload)) {
      const detailedMessage = this.generatedDetailedMessage(...arguments);
      const transformedPayload = this.transformValidationErrors(
        payload,
        status,
      );
      return new InvalidError(transformedPayload.errors, detailedMessage);
    }
    return super.handleResponse(status, headers, payload, requestData);
  }

  /**
   * Add convenience booleans to each error within the errors list indicating
   * the type of error that occurred. This is useful in downstream templates,
   * e.g. `{{if error.isForbidden}}`.
   *
   * Error booleans are attached based on the error status code:
   *
   *   - `401 isUnauthenticated`:  the session isn't authenticated
   *   - `403 isForbidden`:  the session is authenticated but does not have
   *                         permission to perform the requested action
   *   - `404 isNotFound`:  the requested resource could not be found
   *   - `500 isServer`:  an internal server error occurred
   *   - `isUnknown`:  an error occurred, but we don't know which or
   *                   we don't distinguish it yet
   *
   * @override
   * @method normalizeErrorResponse
   * @param  {Number} status
   * @param  {Object} headers
   * @param  {Object} payload
   * @return {Array} errors payload
   */
  normalizeErrorResponse(/*status, headers, payload*/) {
    const errors = super.normalizeErrorResponse(...arguments);
    if (isArray(errors)) {
      errors.forEach((error) => {
        switch (Number(error.status)) {
          case 401:
            error.isUnauthenticated = true;
            break;
          case 403:
            error.isForbidden = true;
            break;
          case 404:
            error.isNotFound = true;
            break;
          case 500:
            error.isServer = true;
            break;
          default:
            error.isUnknown = true;
        }
      });
    }
    return errors;
  }

  /**
   * Normalizes the errors found in a payload from our API into JSON API
   * error format.
   *
   * @param {object} payload
   * @param status
   * @return {object}
   */
  transformValidationErrors(payload, status) {
    const fieldErrors = get(payload, 'details.request_fields') || [];
    // Normalize the primary error message into "base", which is an error
    // that applies to the whole model instance
    const baseError = {
      isInvalid: true,
      status,
      code: payload?.kind,
      detail: payload?.message,
      source: { pointer: '/data' },
    };
    // Normalize field-specific errors, if any.
    const errors = fieldErrors.map((error) => ({
      detail: error.description,
      // Going forward, nested attributes will be hoisted.  Thus "attributes."
      // must be stripped from the error name key.
      source: {
        pointer: `/data/attributes/${error.name.replace('attributes.', '')}`,
      },
    }));

    // Return a list of JSON API errors rooted under the `errors` key.
    return {
      errors: [baseError, ...errors],
    };
  }

  /**
   * Returns `payload.message`, which our API provides as a top-level
   * description of the error that occurred.
   *
   * @override
   * @method generatedDetailedMessage
   * @private
   * @param  {Number} status
   * @param  {Object} headers
   * @param  {Object} payload
   * @param  {Object} requestData
   * @return {String} detailed error message
   */
  generatedDetailedMessage(status, headers, payload /*, requestData*/) {
    return payload?.message;
  }
}
