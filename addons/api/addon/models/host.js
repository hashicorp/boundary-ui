import GeneratedHostModel from '../generated/models/host';
import { fragment } from 'ember-data-model-fragments/attributes';

export default class HostModel extends GeneratedHostModel {

  /**
   * Attributes of this resource, if any, represented as a JSON fragment.
   * @type {FragmentHostAttributesModel}
   */
  @fragment('fragment-host-attributes', { defaultValue: {} }) attributes;

}
