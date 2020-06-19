import RESTAdapter from '@ember-data/adapter/rest';
import config from 'ember-get-config';
import { get } from '@ember/object';
import { InvalidError } from '@ember-data/adapter/error';
import { dasherize } from '@ember/string';
import { pluralize } from 'ember-inflector';
import { isArray } from '@ember/array';

export default class ApplicationAdapter extends RESTAdapter {
  // =attributes

  /**
   * Sets host to the `api.host` string in the application's config,
   * if set.
   * @type {string}
   */
  host = get(config, 'api.host');

  /**
   * Sets namespace to the `api.namespace` string in the application's config,
   * if set.
   * @type {string}
   */
  namespace = get(config, 'api.namespace');

  // =methods

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
   * Overrides default ajax method by rewritting PUT requests as PATCH.
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
      const transformedPayload = this.transformValidationErrors(payload);
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
      errors.forEach(error => {
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
   * @return {object}
   */
  transformValidationErrors(payload) {
    const fieldErrors = get(payload, 'details.fields') || [];
    // Normalize the primary error message into "base", which is an error
    // that applies to the whole model instance
    const baseError = {
      isInvalid: true,
      status: payload.source,
      code: payload.code,
      detail: payload.message,
      source: { pointer: '/data' },
    };
    // Normalize field-specific errors, if any.
    const errors = fieldErrors.map((error) => ({
      detail: error.message,
      source: { pointer: `/data/attributes/${error.name}` },
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
    return payload.message;
  }
}
