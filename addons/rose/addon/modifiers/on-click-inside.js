import { modifier } from 'ember-modifier';

/**
 * Used to detect clicks occuring _inside_ the modified element.
 * This is useful especially for dropdowns to toggle content visibility
 * when the user clicks an item.
 */
export default modifier((element, [callback]) => {
  function handleClick(event) {
    if (element.contains(event.target)) {
      callback(element, event);
    }
  }

  element.addEventListener('click', handleClick, false);

  return () => {
    element.removeEventListener('click', handleClick, false);
  };
});
