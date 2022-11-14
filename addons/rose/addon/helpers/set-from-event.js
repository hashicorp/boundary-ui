import { helper } from '@ember/component/helper';
import { set } from '@ember/object';

export function setFromEvent([context, field]) {
  // The Ember `set` function is used here because `field` may be in dotted
  // notation, refering to nested fields within `context`.
  return (event) =>
    event?.target?.value ? set(context, field, event.target.value) : null;
}

export default helper(setFromEvent);
