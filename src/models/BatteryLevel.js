import { types } from 'mobx-state-tree';

const BatteryLevel = types.model({
  id: types.identifier,
  deviceId: types.string,
  batteryLevel: types.number,
  serverTime: types.string,
});

export default BatteryLevel;
