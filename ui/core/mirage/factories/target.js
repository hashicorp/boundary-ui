import factory from '../generated/factories/target';
import { trait } from 'ember-cli-mirage';

const randomBoolean = (chance = 0.5) => Math.random() < chance;
const hostSetChance = 0.3;

export default factory.extend({

  /**
   * Randomly selects existing host sets to assign to target.
   */
  withRandomHostSets: trait({
    afterCreate(target, server) {
      let randomlySelectedHostSets;
      randomlySelectedHostSets = server.schema.hostSets
        .where(item => item.scope.id === target.scope.id).models
        .filter(() => randomBoolean(hostSetChance));
      target.update({hostSets: randomlySelectedHostSets});
    }
  })

});
