import { types } from 'mobx-state-tree';

export default function createCollection(ItemClass) {
  return types.model({
    hasLoaded: false,
    isLoading: false,
    deviceId: types.maybe(types.string),
    limit: types.optional(types.number, 5),
    startDate: types.maybe(types.string),
    endDate: types.maybe(types.string),
    items: types.optional(types.array(ItemClass), []),
  });
}
