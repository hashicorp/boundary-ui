import GeneratedSessionModel from '../generated/models/session';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { typeOf } from '@ember/utils';

/**
 *
 */
class SessionCredential {
  // =classes

  /**
   *
   */
  static Library = class Library {
    id;
    name;
    description;
    type;

    constructor(id, name, description, type) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.type = type;
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
  library;
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
      return Object.keys(secretJSON).map(
        (key) => new SessionCredential.SecretItem(key, secretJSON[key])
      );
    } else {
      // decode from base64
      const decodedString = atob(this.#payloadSecret.raw);
      return [new SessionCredential.SecretItem('secret', decodedString)];
    }
  }

  // =methods

  constructor(cred) {
    const { id, name, description, type } = cred.credential_library;
    this.library = new SessionCredential.Library(id, name, description, type);
    this.#payloadSecret = cred.secret;
    this.rawCredential = cred;
  }
}

export default class SessionModel extends GeneratedSessionModel {
  // =attributes

  // These transient attributes are used for values that come from the CLI
  // `connect` command as triggered by Desktop.  These attributes represent
  // transient read-only values.
  @tracked acknowledged;
  @tracked started_desktop_client;
  @tracked proxy_address;
  @tracked proxy_port;
  credentials = A();

  @equal('status', 'active') isActive;
  @equal('status', 'pending') isPending;

  /**
   * @type {boolean}
   */
  @computed('isActive', 'isPending')
  get isCancelable() {
    return this.isActive || this.isPending;
  }

  /**
   * The full proxy address and port if address exists, otherwise null.
   * @type {?string}
   */
  @computed('proxy_address', 'proxy_port')
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
    return this.store.peekRecord('target', this.target_id);
  }

  // =methods

  /**
   *
   */
  addCredential(cred) {
    this.credentials.pushObject(new SessionCredential(cred));
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
