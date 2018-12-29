import { types, flow } from 'mobx-state-tree';
import uuid4 from 'uuid/v4';
import PositionCollection from './PositionCollection';
import BatteryLevelCollection from './BatteryLevelCollection';

const Device = types
  .model({
    id: types.optional(types.identifier, uuid4),
    deviceId: types.string,
    name: types.string,
    positionCollection: types.maybe(PositionCollection),
    batteryLevelCollection: types.maybe(BatteryLevelCollection),
  })
  .actions(self => ({
    afterCreate: flow(function*() {
      self.positionCollection = PositionCollection.create({
        deviceId: self.deviceId,
      });
      self.batteryLevelCollection = BatteryLevelCollection.create({
        deviceId: self.deviceId,
      });
    }),
    editProperty(name, value) {
      self[name] = value;
    },
  }));

export default Device;
