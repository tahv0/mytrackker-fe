import { types, flow, applySnapshot } from 'mobx-state-tree';
import Position from './Position';
import createCollection from './BaseCollection';
import client from '../client';
import gql from 'graphql-tag';

const PositionBaseCollection = types.model({}).actions(self => ({
  afterCreate: flow(function*() {
    yield self.fetchPositions();
  }),
  fetchPositions: flow(function*() {
    try {
      self.isLoading = true;
      const response = yield client.query({
        query: gql`{
    getPositions(deviceId: "${self.deviceId}", limit: ${self.limit}) {
      id
      deviceId
      latitude
      longitude
      speed
      accuracy
      altitude
      serverTime
    }
  }`,
      });
      applySnapshot(self.items, response.data.getPositions);
    } finally {
      self.isLoading = false;
    }
  }),
}));

const PositionCollection = types.compose(
  createCollection(Position),
  PositionBaseCollection
);

export default PositionCollection;
