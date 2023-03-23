import fetch from 'fetch';

export async function initialize(owner) {
  let edition;
  const url = '/controller-metadata.json';
  // Attempt to load edition for the metadata JSON
  try {
    const response = await fetch(url);
    const json = await response.json();
    edition = edition || json?.license?.edition;
  } catch (e) {
    // no op
  }
  // Initialize the feature edition service with the specified edition
  const service = owner.lookup('service:feature-edition');
  service.initialize(edition);
}

export default {
  initialize,
};
