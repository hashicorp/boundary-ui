/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import * as AsciinemaPlayer from 'asciinema-player';
import { modifier } from 'ember-modifier';

export default class SessionRecordingPlayerAsciinemaPlayerComponent extends Component {
  // =properties

  /**
   * @type {?AsciinemaPlayer}
   */
  player = null;

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
    return this.supportedOptions.reduce((obj, key) => {
      return this.args?.[key] !== undefined
        ? { ...obj, [key]: this.args[key] }
        : obj;
    }, {});
  }

  /**
   * Creates an AsciinemaPlayer within the passed `containerElement`.
   */
  initializePlayer = modifier((containerElement, _, { data }) => {
    if (!data) return;
    this.player = AsciinemaPlayer.create(
      { data },
      containerElement,
      this.options,
    );

    return () => {
      this.player?.dispose();
      this.player = null;
    };
  });
}
