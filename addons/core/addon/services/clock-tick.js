import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { next } from '@ember/runloop';

export default class ClockTickService extends Service {
  // =attributes

  /**
   * The current datetime.  This is updated once every `interval` while the
   * service is running (1s by default).
   * @type {number}
   */
  @tracked now = Date.now();

  /**
   * The frequency to update `now`, in milliseconds.
   * @type {number}
   */
  frequency = 1000;

  /**
   * The timer interval ID
   */
  #timer;

  /**
   * This service is enabled only in non-test environments.
   * @type {boolean}
   */
  get enabled() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return config.environment !== 'test';
  }

  // =methods

  /**
   * Starts the timer, if enabled.
   */
  constructor() {
    super(...arguments);
    if (this.enabled) this._start();
  }

  /**
   * Stops the timer.
   */
  willDestroy() {
    super.willDestroy(...arguments);
    this._stop();
  }

  /**
   * Sets up the timer interval, calling `_tick()` every
   * `frequency` milliseconds.
   */
  _start() {
    const self = this;
    this.#timer = setInterval(function () {
      self._tick();
    }, this.frequency);
  }

  /**
   * Clears the timer interval.
   */
  _stop() {
    clearInterval(this.#timer);
  }

  /**
   * Updates the value of `now` within the next runloop.
   */
  _tick() {
    next(() => (this.now = Date.now()));
  }
}
