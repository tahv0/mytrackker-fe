import { types } from 'mobx-state-tree';

const Position = types.model({
  id: types.identifier,
  deviceId: types.string,
  latitude: types.number,
  longitude: types.number,
  speed: types.number,
  accuracy: types.number,
  altitude: types.number,
  serverTime: types.string,
});

export default Position;
