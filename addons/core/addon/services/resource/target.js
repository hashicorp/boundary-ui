import ResourceBaseService from '../resource';
import { TYPE_SSH, types } from 'api/models/target';

// Generate a list of types that excluseds `ssh`.
const typesExcludingSSH = types.filter((type) => type !== TYPE_SSH);

export default class ResourceTargetService extends ResourceBaseService {
  // =attributes

  type = 'target';

  // Normally, `types` imported from the model can be passed through directly
  // to the service's `_types`.  However for targets, SSH is hand-selected
  // for UX purposes to appear first.
  _types = [TYPE_SSH, ...typesExcludingSSH];
}
