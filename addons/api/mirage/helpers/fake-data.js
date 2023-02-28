import { faker } from '@faker-js/faker';

/**
 * Returns either an empty string or random words, with a 50/50 chance.
 */
export const name = () =>
  faker.helpers.arrayElement(['', faker.random.words()]);
