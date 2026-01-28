/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

export default class DurationTransform {
  /**
   * Normalize a duration string in the format "3.0001s" to milliseconds.
   * The backend returns a precision of nanoseconds but we round to whole
   * milliseconds to avoid any issues with floating point math.
   * @param serialized
   * @returns {number}
   */
  deserialize(serialized) {
    if (!serialized) return 0;
    const duration = serialized.split('s')[0];
    return Math.round(parseFloat(duration) * 1000);
  }

  /**
   * Serialize a duration in ms to a string in seconds.
   * @param deserialized
   * @returns {string}
   */
  serialize(deserialized) {
    if (!deserialized) return '0s';
    const durationInSeconds = deserialized / 1000;

    // We use `toLocaleString` to handle scenarios with very large numbers or
    // very small numbers which will be represented as exponents.
    // We force the max number of fraction digits to match the precision of the
    // backend which is in nanoseconds.
    return `${durationInSeconds.toLocaleString('fullwide', {
      useGrouping: false,
      maximumFractionDigits: 9,
    })}s`;
  }

  static create() {
    return new this();
  }
}
