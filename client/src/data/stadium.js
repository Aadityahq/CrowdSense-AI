export const stadiumZones = [
  { id: 'C1', name: 'Gate 1', type: 'entry', capacity: 100, lat: 22.5698, lng: 88.3636 },
  { id: 'C2', name: 'Gate 2', type: 'entry', capacity: 100, lat: 22.5693, lng: 88.3656 },
  { id: 'A1', name: 'North Stand', type: 'seat', capacity: 1000, lat: 22.5712, lng: 88.3641 },
  { id: 'A2', name: 'South Stand', type: 'seat', capacity: 1000, lat: 22.5684, lng: 88.3652 },
  { id: 'B1', name: 'Food Court', type: 'service', capacity: 250, lat: 22.5702, lng: 88.3658 },
  { id: 'B2', name: 'Washrooms', type: 'service', capacity: 150, lat: 22.5689, lng: 88.3639 },
  { id: 'E1', name: 'North Exit', type: 'exit', capacity: 999, lat: 22.5721, lng: 88.3637 },
  { id: 'E2', name: 'South Exit', type: 'exit', capacity: 999, lat: 22.5676, lng: 88.3662 },
];

export const stadiumGraph = {
  C1: [{ node: 'A1', distance: 3 }, { node: 'B1', distance: 4 }, { node: 'B2', distance: 5 }],
  C2: [{ node: 'A2', distance: 3 }, { node: 'B1', distance: 4 }, { node: 'B2', distance: 4 }],
  A1: [{ node: 'B1', distance: 2 }, { node: 'B2', distance: 3 }, { node: 'E1', distance: 5 }],
  A2: [{ node: 'B1', distance: 2 }, { node: 'B2', distance: 3 }, { node: 'E2', distance: 5 }],
  B1: [{ node: 'A1', distance: 2 }, { node: 'A2', distance: 2 }, { node: 'B2', distance: 2 }, { node: 'E1', distance: 6 }, { node: 'E2', distance: 6 }],
  B2: [{ node: 'A1', distance: 3 }, { node: 'A2', distance: 3 }, { node: 'E1', distance: 4 }, { node: 'E2', distance: 4 }, { node: 'B1', distance: 2 }],
  E1: [],
  E2: [],
};

export const stadiumCenter = [22.5698, 88.3648];

export const stadiumNodeMap = stadiumZones.reduce((accumulator, zone) => {
  accumulator[zone.id] = zone;
  return accumulator;
}, {});

