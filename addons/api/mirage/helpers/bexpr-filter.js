import { makeEvaluator } from 'js-bexpr';

/**
 * Creates a filter function that operates on a single object, which itself
 * returns the result of evaluating the expression against the object.
 */
export default (expression) => {
  if (expression) {
    const evaluator = makeEvaluator(expression);
    // Since API query selectors begin with `/item`, the instance is wrapped.
    return (item) => evaluator({ item });
  } else {
    // If no expression was passed, always return true,
    // thus filtering out none.
    return () => true;
  }
};
