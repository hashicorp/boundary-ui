import RESTAdapter from '@ember-data/adapter/rest';
import { serializeIntoHash } from '@ember-data/adapter/-private';
import AdapterBuildURLMixin from '../mixins/adapter-build-url';
import config from 'ember-get-config';
import { get, getWithDefault } from '@ember/object';
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
  return payloadIsBlank(response) ? {items: []} : response;
}

export default class ApplicationAdapter extends RESTAdapter.extend(
  AdapterBuildURLMixin
) {
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
   * Prepends a scope to the URL prefix.  Precedence is given to the ID passed
   * via `adapterOptions.scopeID`.  If this value isn't found in
   * `adapterOptions`, we look to the `scope.scope_id` field on the snapshot,
   * which most resources have.
   *
   * Note:  scopes themselves never receive a scope URL prefix.
   *
   * @override
   * @param {string} path
   * @param {string} parentURL
   * @param {string} modelName
   * @param {string} id
   * @param {object} snapshot
   * @return {string}
   */
  urlPrefix(path, parentURL, modelName, id, snapshot) {
    const prefix = super.urlPrefix(...arguments);
    const isScope = modelName === 'scope';
    let scopePath = '';
    let scopeID = '';
    if (snapshot) {
      // Not all snapshots have `attr` (such as array snapshots),
      // so we do this sort of ugly check.
      if (snapshot.attr) {
        const parentScope = snapshot.attr('scope');
        if (parentScope) scopeID = parentScope.attr('scope_id');
      }
      // Attempt to get scopeID from adapterOptions and fallback on its current
      // value if it wasn't passed through options.
      scopeID = getWithDefault(snapshot, 'adapterOptions.scopeID', scopeID);
    }
    // Only non-scope resources need a scope path, since scope resources
    // aren't technically "scoped" the same way.
    // Ensure a slash is added between prefix + scope path if needed.
    if (!isScope && scopeID && prefix.charAt(prefix.length - 1) !== '/') {
      scopePath = `/scopes/${scopeID}`;
    }
    return `${prefix}${scopePath}`;
  }

  /**
   * Appends a custom method after a colon, if a method is passed via the
   * snapshot's `adapterOptions.method` field.
   * @param {string} modelName
   * @param {string} id
   * @param {object} snapshot
   * @return {string}
   */
  urlSuffix(modelName, id, snapshot={}) {
    const method = getWithDefault(snapshot, 'adapterOptions.method', '');
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
   * @override
   * @method findAll
   * @return {Promise} promise
   */
  findAll() {
    return super.findAll(...arguments).then(prenormalizeArrayResponse);
  }

  /**
   * Intercepts "empty" responses and adds an empty `items` array.
   * @override
   * @method query
   * @return {Promise} promise
   */
  query() {
    return super.query(...arguments).then(prenormalizeArrayResponse);
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
