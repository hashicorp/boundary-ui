import { helper } from '@ember/component/helper';
import { set } from '@ember/object';

export function setFromEvent([context, field]) {
  return (event) =>
    event?.target?.value ? set(context, field, event.target.value) : null;
}

export default helper(setFromEvent);
