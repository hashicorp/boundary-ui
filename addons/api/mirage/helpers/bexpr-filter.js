/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { makeEvaluator } from 'js-bexpr';
import { underscore } from '@ember/string';

/**
 * Because Mirage, a record cannot be serialized outside of a route handler
 * context.  Here is a quick and dirty attempt to serialize attribute names
 * to underscore format.  This is not entirely realistic, but may suffice.
 */
const quickSerialize = (item) => {
  const json = item.toJSON();
  Object.keys(json).forEach((key) => {
    const newKey = underscore(key);
    json[newKey] = json[key];
  });
  return json;
};

/**
 * Creates a filter function that operates on a single object, which itself
 * returns the result of evaluating the expression against the object.
 */
export default (expression) => {
  if (expression) {
    const evaluator = makeEvaluator(expression);
    // Since API query selectors begin with `/item`, the instance is wrapped.
    return (record) => {
      const item = quickSerialize(record);
      return evaluator({ item });
    };
  } else {
    // If no expression was passed, always return true,
    // thus filtering out none.
    return () => true;
  }
};
