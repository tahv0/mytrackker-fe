import { types, flow, applySnapshot } from 'mobx-state-tree';
import BatteryLevel from './BatteryLevel';
import createCollection from './BaseCollection';
import client from '../client';
import gql from 'graphql-tag';

const BatteryLevelBaseCollection = types.model({}).actions(self => ({
  afterCreate: flow(function*() {
    yield self.fetchBatteryLevels();
  }),
  fetchBatteryLevels: flow(function*() {
    const response = yield client.query({
      query: gql`{
      getBatteryLevels(deviceId: "${self.deviceId}", limit: ${self.limit}) {
        id
        deviceId
        batteryLevel
        serverTime
      }
    }`,
    });
    applySnapshot(self.items, response.data.getBatteryLevels);
  }),
}));

const BatteryLevelCollection = types.compose(
  createCollection(BatteryLevel),
  BatteryLevelBaseCollection
);

export default BatteryLevelCollection;
