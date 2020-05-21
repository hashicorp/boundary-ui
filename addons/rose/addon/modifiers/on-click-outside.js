import { modifier } from 'ember-modifier';

export default modifier((element, [callback]) => {
  function handleClick(event) {
    if (!element.contains(event.target)) {
      callback(element, event);
    }
  }

  document.addEventListener('click', handleClick, false);

  return () => {
    document.removeEventListener('click', handleClick, false);
  };
});
