/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedSessionModel from '../generated/models/session';
import { equal } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { service } from '@ember/service';
import { flattenObject } from '../utils/flatten-nested-object';
import { TYPES_CREDENTIAL_LIBRARY } from 'api/models/credential-library';
import { TYPE_CREDENTIAL_JSON } from 'api/models/credential';

export const STATUS_SESSION_ACTIVE = 'active';
export const STATUS_SESSION_PENDING = 'pending';
export const STATUS_SESSION_CANCELING = 'canceling';
export const STATUS_SESSION_TERMINATED = 'terminated';
export const statusTypes = [
  STATUS_SESSION_ACTIVE,
  STATUS_SESSION_PENDING,
  STATUS_SESSION_CANCELING,
  STATUS_SESSION_TERMINATED,
];

/**
 *
 */
export class SessionCredential {
  // =classes

  /**
   *
   */
  static Source = class Source {
    id;
    name;
    description;
    type;
    credentialtype;

    constructor(id, name, description, type, credentialtype) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.type = type;
      this.credentialType = credentialtype;
    }
  };

  /**
   *
   */
  static SecretItem = class SecretItem {
    key;
    value;

    constructor(key, value) {
      this.key = key;
      this.value = value;
    }
  };

  // =attributes
  rawCredential;
  source;
  #payloadSecret;

  /**
   * The incoming payload may contain a JSON object under the `decoded` key only
   * if it can be JSON-decoded.  Some credential stores may not provide JSON,
   * however, in which case we may have only the raw base64-encoded secret
   * string.  In the former case, we convert the key/value pairs of the JSON to
   * an array of `SecretItem` instances.  In the latter case, we return an
   * array containing a single `SecretItem` instance with key `secret` and a
   * string value equal to the base64-decoded raw secret.
   * The credential secret as an array of key/value objects.
   * @type {SessionCredential.SecretItem[]}
   */
  get secrets() {
    if (this.#payloadSecret?.decoded) {
      const secretJSON = this.#payloadSecret.decoded;
      return this.extractSecrets(
        secretJSON,
        this.source.type,
        this.source.credentialType,
      );
    } else {
      // decode from base64
      const decodedString = atob(this.#payloadSecret.raw);
      return [new SessionCredential.SecretItem('secret', decodedString)];
    }
  }

  /**
   * Extracts secrets from the payload secret JSON object.
   * We only need to flatten the object if the type is vault or if its a json type credential.
   * @param {object} secretJSON - The payload secret JSON object.
   * @param {string} type - The credential source type.
   * @param {string} credentialType - The credential type.
   * @returns {SessionCredential.SecretItem[]} - The array of secret items.
   */
  extractSecrets(secretJSON, type, credentialType) {
    let source;
    if (credentialType === TYPE_CREDENTIAL_JSON) {
      source = flattenObject(secretJSON);
    } else if (TYPES_CREDENTIAL_LIBRARY.includes(type) && secretJSON?.data) {
      source = flattenObject(secretJSON.data);
    } else {
      source = secretJSON;
    }

    return Object.entries(source).map(
      ([key, value]) => new SessionCredential.SecretItem(key, value),
    );
  }

  // =methods

  constructor(cred) {
    const { id, name, description, type, credential_type } =
      cred.credential_source;
    this.source = new SessionCredential.Source(
      id,
      name,
      description,
      type,
      credential_type,
    );
    this.#payloadSecret = cred.secret;
    this.rawCredential = cred;
  }
}

export default class SessionModel extends GeneratedSessionModel {
  // =services

  @service store;

  // =attributes

  // These transient attributes are used for values that come from the CLI
  // `connect` command as triggered by Desktop.  These attributes represent
  // transient read-only values.
  @tracked acknowledged;
  @tracked started_desktop_client;
  @tracked proxy_address;
  @tracked proxy_port;
  @tracked host;
  credentials = A();

  @equal('status', STATUS_SESSION_ACTIVE) isActive;
  @equal('status', STATUS_SESSION_PENDING) isPending;

  /**
   * True if status is an unknown string.
   * @type {boolean}
   */
  get isUnknownStatus() {
    return !statusTypes.includes(this.status);
  }

  /**
   * @type {boolean}
   */
  get isAvailable() {
    return this.isActive || this.isPending;
  }

  /**
   * The full proxy address and port if address exists, otherwise null.
   * @type {?string}
   */
  get proxy() {
    return this.proxy_address
      ? `${this.proxy_address}:${this.proxy_port}`
      : null;
  }

  /**
   * The target associated with this session (if loaded).
   * @type {TargetModel}
   */
  get target() {
    if (!this.target_id) {
      return null;
    }
    return this.store.peekRecord('target', this.target_id);
  }

  /**
   * The user associated with this session (if loaded).
   * @type {UserModel}
   */
  get user() {
    if (!this.user_id) {
      return null;
    }
    return this.store.peekRecord('user', this.user_id);
  }

  // =methods

  /**
   *
   */
  addCredential(cred) {
    this.credentials.pushObject(new SessionCredential(cred));
  }

  /**
   * Adds associated host to session if host present
   * @param {HostModel} host
   */
  addHost(host) {
    this.host = host;
  }

  /**
   * Cancels the session via the `cancel` method.
   * See serializer and adapter for more information.
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  cancelSession(options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'cancel',
    };
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }
}
