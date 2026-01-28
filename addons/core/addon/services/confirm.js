/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { filterBy } from '@ember/object/computed';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { defer, resolve } from 'rsvp';
import { getOwner } from '@ember/application';

/**
 * A simple service that emits Confirmation instances and
 * exposes a `pending` property to discover pending
 * confirmations.
 * @augments Service
 *
 * @example
 *    const confirmation = confirmationService.confirm('Text', { type: 'discard' });
 */
export default class ConfirmationsService extends Service {
  // =attributes

  #enabled;

  /**
   * When the confirm service is disabled, it always returns resolving promises.
   * By default the service is enabled but it is useful to disable it for test
   * purposes.
   * @type {boolean}
   */
  get enabled() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return this.#enabled ?? config.enableConfirmService ?? true;
  }
  set enabled(value) {
    this.#enabled = value;
  }

  /**
   * @type {Array}
   */
  confirmations = A();

  /**
   * An array of pending confirmations (those where `done === false`).
   * @type {Array}
   */
  @filterBy('confirmations', 'done', false) pending;

  // =methods

  /**
   * When the service is enabled, returns a promise that resolves if the user
   * accepts the confirmation, otherwise rejects.  If the service is disabled,
   * this method always returns a resolving promise.
   * @param {string} text
   * @param {object} options
   * @return {Promise}
   */
  confirm(text, options) {
    if (this.enabled) {
      const confirmation = new Confirmation(text, options);
      this.confirmations.addObject(confirmation);
      return confirmation;
    } else {
      return resolve();
    }
  }
}

/**
 * A promise-like object that is either "confirmed" or "dismissed", represented
 * internally by a promise that resolves or rejects.  Confirmations may be used
 * as promises via `then`, `catch`, and `finally`.
 *
 * Not intended for instantiation directly.  Use the confirmation service
 * to create confirmation instances.
 *
 * @example
 *    const confirmation = new Confirmation('Text', { type: 'discard' });
 *    confirmation.confirm();
 *    // confirmation.done now equals true
 *    confirmation
 *      .then(() => { }) // do something
 *      .catch(() => { }) // not called, since the confirmation is confirmed
 *      .finally(() => { });   // do something
 *
 * @example
 *    const confirmation = new Confirmation('Text', { type: 'discard' });
 *    confirmation.dismiss();
 *    // confirmation.done now equals true
 *    confirmation
 *      .then(() => { }) // not called, since the confirmation is dismissed
 *      .catch(() => { }) // do something
 *      .finally(() => { });   // do something
 */
class Confirmation {
  // =properties

  /**
   * Indicates whether the confirmation has been confirmed or dismissed.
   * Automatically set to `true` after `confirm` or `dismiss` are called.
   * @type {Boolean}
   */
  @tracked done = false;

  #deferred = null;

  /**
   * Sets the type field to the specified type and sets up a defer.
   * @param {String} type  An optional type annotation for convenience.
   *    Has no effect on confirmation.
   */
  constructor(text, options = {}) {
    this.text = text;
    this.options = options;
    this.#deferred = defer();
  }

  /**
   * Sets the confirmation to done and resolves the defer.
   */
  confirm() {
    this.done = true;
    this.#deferred.resolve();
  }

  /**
   * Sets the confirmation to done and rejects the defer.
   */
  dismiss() {
    this.done = true;
    this.#deferred.reject();
  }

  /**
   * Delegates to the internal defer promise, allowing the
   * confirmation to be treated like a promise.
   */
  then() {
    return this.#deferred.promise.then(...arguments);
  }

  /**
   * Delegates to the internal defer promise, allowing the
   * confirmation to be treated like a promise.
   */
  catch() {
    return this.#deferred.promise.catch(...arguments);
  }

  /**
   * Delegates to the internal defer promise, allowing the
   * confirmation to be treated like a promise.
   */
  finally() {
    return this.#deferred.promise.finally(...arguments);
  }
}
