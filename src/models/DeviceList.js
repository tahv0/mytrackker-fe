import { types, getSnapshot } from 'mobx-state-tree';
import Device from './Device';

const DeviceList = types
  .model({
    currentDevice: types.maybe(types.reference(Device)),
    devices: types.optional(types.array(Device), []),
  })
  .actions(self => ({
    setCurrentDevice(device) {
      self.currentDevice = device;
    },
    addDevice(device) {
      self.devices.push(getSnapshot(device));
    },
  }));

export default DeviceList;
