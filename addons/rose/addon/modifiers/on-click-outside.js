import { modifier } from 'ember-modifier';

/**
 * Used to detect clicks occuring _outside_ of the modified element.
 * This is useful especially for dropdowns to toggle content visibility
 * when the user clicks away.
 */
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
