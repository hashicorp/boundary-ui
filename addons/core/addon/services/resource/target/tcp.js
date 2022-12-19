import ResourceTypeService from '../../resource-type';
import { TYPE_TCP } from 'api/models/target';

export default class ResourceTargetTcpService extends ResourceTypeService {
  // =attributes

  resourceType = 'target';

  type = TYPE_TCP;
  icon = 'network';
}
