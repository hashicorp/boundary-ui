/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { later } from '@ember/runloop';
import * as AsciinemaPlayer from 'asciinema-player';

export default class HeapPlayerComponent extends Component {
  // =properties

  /**
   * @type {?AsciinemaPlayer}
   */
  @tracked player = null;

  /**
   *
   */
  initialized = false;

  /**
   * Options of the underlying AsciinemaPlayer supported by this component,
   * which may be passed as named arguments to the player.
   * @type {string[]}
   * @see https://github.com/asciinema/asciinema-player#options
   */
  supportedOptions = new Array(
    'autoPlay',
    'loop',
    'startAt',
    'speed',
    'idleTimeLimit',
    'theme',
    'poster',
    'fit',
    'controls',
    'markers',
    'pauseOnMarkers',
  );

  /**
   * An object of options where each possible key from `supportOptions` is
   * included if and only if its associated value was passed to the component
   * as an argument.
   *
   * E.g. `@autoPlay={{true}} @fit='both'` results in
   * the options object `{autoPlay: true, fit: 'both'}`.
   * @type {object}
   * @see https://github.com/asciinema/asciinema-player#options
   */
  get options() {
    return this.supportedOptions.reduce(
      (obj, key) => {
        return this.args?.[key] !== undefined
          ? { ...obj, [key]: this.args[key] }
          : obj
      },
      {}
    );
  }

  // =methods

  /**
   * Initializes the asciinema player within the current element.
   * @param {object|string}
   *   source - URL or object passed through to AsciinemaPlayer.create(source).
   * @param {Element}
   *   containerElement - DOM element passed from the did-insert modifier.
   * @returns {AsciinemaPlayer}
   */
  create(source, containerElement, options) {
    // cleanup previous player, if any
    this.dispose();
    // initialize a new AsciinemaPlayer
    this.player =
      AsciinemaPlayer.create(source, containerElement, options);
    return this.player;
  }

  /**
   * Calls asciinema-player's `dispose()` method to destroy the player and
   * cleanup the DOM.  Unsets this component's `player` property.
   */
  dispose() {
    this.player?.dispose();
    this.player = null;
  }

  // =actions

  /**
   * Creates an AsciinemaPlayer within the passed `containerElement`.
   */
  @action
  initializePlayer(containerElement) {
    const { data } = this.args;
    this.create({ data }, containerElement, this.options);
  }

  /**
   * Destroys the currently initialized AsciinemaPlayer, if any.
   */
  @action
  destroyPlayer() {
    later(() => this.dispose(), 250);
  }
}
