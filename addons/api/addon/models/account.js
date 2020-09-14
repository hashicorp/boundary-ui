import GeneratedAccountModel from '../generated/models/account';
import { fragment } from 'ember-data-model-fragments/attributes';

export default class AccountModel extends GeneratedAccountModel {

  /**
   * Attributes of this resource, if any, represented as a JSON fragment.
   * @type {FragmentAccountAttributesModel}
   */
  @fragment('fragment-account-attributes', { defaultValue: {} }) attributes;

}
