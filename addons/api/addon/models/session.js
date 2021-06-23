import GeneratedSessionModel from '../generated/models/session';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

class SessionCredential {
  // =attributes
  rawCredential;
  credential_library_id;
  credential_library_name;
  credential_library_description;
  credential_library_type;
  purpose;
  #secret;

  get secret() {
    return atob(this.#secret);
  }

  // =methods

  constructor(cred) {
    this.rawCredential = cred;
    this.credential_library_id = cred.credential_library.id;
    this.credential_library_name = cred.credential_library.name;
    this.credential_library_description = cred.credential_library.description;
    this.credential_library_type = cred.credential_library.type;
    this.purpose = cred.purpose;
    this.#secret = cred.secret;
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
