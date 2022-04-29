import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

const MILLISECOND = 1;
const SECOND = MILLISECOND * 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const MONTH = DAY * 31;
const YEAR = MONTH * 12;

// common time intervals in milliseconds
const unitMappings = [
  {
    unit: 'second',
    value: SECOND,
  },
  {
    unit: 'minute',
    value: MINUTE,
  },
  {
    unit: 'hour',
    value: HOUR,
  },
  {
    unit: 'day',
    value: DAY,
  },
  {
    unit: 'month',
    value: MONTH,
  },
  {
    unit: 'year',
    value: YEAR,
  },
];

export default class RelativeDatetimeLiveComponent extends Component {
  // =services

  @service clockTick;
  @service intl;

  // =properties

  /**
   * The difference in milliseconds between the date argument and the
   * current time.
   * @type {number}
   */
  get delta() {
    return this.args.date.valueOf() - this.clockTick.now;
  }

  /**
   * The greatest meaningful unit is the unit which delta is equal to or
   * greater than.  For example, the unit of a delta equivalent of 59 seconds is
   * 'second' while 60 seconds is 'minute', 36 hours is 'day', etc.
   * @type {object}
   */
  get greatestMeaningfulUnit() {
    return unitMappings.reduce((currentValue, previousValue) => {
      return Math.abs(this.delta) >= previousValue.value
        ? previousValue
        : currentValue;
    }, unitMappings[0]);
  }

  /**
   * The delta value scaled to the greatest meaningful unit.  For example, if
   * the delta is 1000 ms, the scaled value is 1, which corresponds to
   * a GMU of 'second'.  A delta of 60000 ms is also 1, corresponding to a GMU
   * of 'minute'.
   * @type {number}
   */
  get scaledDelta() {
    if (this.delta < 0) {
      return Math.ceil(this.delta / this.greatestMeaningfulUnit.value);
    }
    return Math.floor(this.delta / this.greatestMeaningfulUnit.value);
  }

  /**
   * A string representation of the greatest meaningful unit.
   * @type {string}
   */
  get unit() {
    return this.greatestMeaningfulUnit.unit;
  }

  /**
   * A localizd relative datetime.  E.g. "30 seconds ago".
   * @type {string}
   */
  get formatted() {
    return this.intl.formatRelative(this.scaledDelta, {
      unit: this.unit,
      numeric: 'auto',
    });
  }
}
