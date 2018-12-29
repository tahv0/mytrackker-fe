import { SecureStore } from 'expo';
import { onSnapshot, types, flow, applySnapshot } from 'mobx-state-tree';

import DeviceList from '../models/DeviceList';

const initialState = { devices: [] };

const DeviceStoreBase = types.model({ loaded: false }).actions(self => ({
  load: flow(function*  () {
    let storedState = initialState;
    try {
      const value = yield SecureStore.getItemAsync('devicesStore');
      const json = JSON.parse(value);
      if (value !== null && DeviceStore.is(json)) {
        storedState = json;
      }
    } catch (error) {
      console.error(error);
      yield SecureStore.setItemAsync('devicesStore', JSON.stringify({}));
    } finally {
      self.loaded = true;
      applySnapshot(self.devices, storedState.devices);
    }
  }),
  afterCreate: async () => {
    await self.load();
    onSnapshot(deviceStore, snapshot => {
      SecureStore.setItemAsync('devicesStore', JSON.stringify(snapshot)).then(() =>
        console.log('saved')
      );
    });
  },
}));

const DeviceStore = types.compose(
  DeviceList,
  DeviceStoreBase
);

const deviceStore = DeviceStore.create(initialState);

export default deviceStore;
