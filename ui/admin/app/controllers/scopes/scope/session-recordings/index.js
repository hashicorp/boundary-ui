import Controller from '@ember/controller';

export default class ScopesScopeSessionRecordingsIndexController extends Controller {
  /**
   * Returns true if any session recordings exist
   * @type {boolean}
   */
  get hasSessionRecordings() {
    return this.model?.sessionRecordings?.length;
  }

  /**
   * Returns true if any storage buckets exist
   * @type {boolean}
   */
  get hasSessionRecordingsConfigured() {
    return this.model?.storageBuckets?.length;
  }
}
