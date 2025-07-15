export const ROLE_TYPES = [
  { label: "No Access", c: 'no-access', key: '0' }, // 'access_create'
  { label: "Own Record", c: 'own-record', key: '1' }, // 
  { label: "Team Record", c: 'businessunit', key: '10000' }, // 'access_read'
  { label: "Parent Child", c: 'parent-child', key: '100000000' }, // 'access_update'
  { label: "Full Access", c: 'organization', key: '1000000000000' }, // 'access_delete'
];

export const ROLE_KEYS = [
  'access_create', 
  'access_read', 
  'access_update', 
  'access_delete', 
  // 'access_append',
  'access_menu',
];

// const ROLE_VALUES = {
//   "0": ROLE_TYPES[0], // NoAccess
//   "1": ROLE_TYPES[1], // OwnRecord
//   "10000": ROLE_TYPES[2], // TeamRecord
//   "100000000": ROLE_TYPES[3], // ParentChild
//   "1000000000000": ROLE_TYPES[4], // FullAccess
// };
