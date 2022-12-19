import ResourceTypeService from '../../resource-type';
import { TYPE_SSH } from 'api/models/target';

export default class ResourceTargetSshService extends ResourceTypeService {
  // =attributes

  resourceType = 'target';

  type = TYPE_SSH;
  icon = 'terminal-screen';
}
