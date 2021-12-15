import { helper } from '@ember/component/helper';

const groupByReducer = (items, key) => {
  const obj = items.reduce((result, item) => {
    if (!result[item[key]]) result[item[key]] = { key: item[key], items: [] };
    result[item[key]].items.push(item);
    return result;
  }, {});
  // Convert object group to an array for iteration
  const arr = Object.keys(obj).map((key) => obj[key]);
  return arr;
};

export default helper(function groupBy([items, key]) {
  const result = groupByReducer(items, key);
  return result;
});
