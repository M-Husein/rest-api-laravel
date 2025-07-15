// export const CLASSIFICATION: any = [
//   {
//     id: '1',
//     title: 'Car',
//     category_code: 65536,
//     logo: require('@/assets/images/classification/car.png'), // 'car.png',
//   },
//   {
//     id: '2',
//     title: 'Motorbike',
//     category_code: 131072,
//     logo: require('@/assets/images/classification/motorbike.png'),
//   },
//   // {
//   //   id: '3',
//   //   title: 'Property',
//   //   logo: require('@/assets/images/classification/property.png'),
//   // },
//   {
//     id: '4',
//     title: 'Technology Device',
//     category_code: 262144,
//     logo: require('@/assets/images/classification/tech_device.png'),
//   },
//   // {
//   //   id: '5',
//   //   title: 'Business',
//   //   logo: require('@/assets/images/classification/business.png'),
//   // },
//   {
//     id: '6',
//     title: 'Premium, classic, and Antiques',
//     category_code: 131076,
//     logo: require('@/assets/images/classification/premium_classic.png'),
//   },
// ];

export const FUEL_TYPES: any = [
  { id: '1', value: 'Gasoline' },
  { id: '2', value: 'Diesel' },
  { id: '3', value: 'Hybrid' },
  { id: '4', value: 'Electric' },
];

/**
 * @one   : 1 - Choose classification / category
 * @two   : 2 - Please Complete Details
 * @three : 3 - Please complete features
 * @four  : 4 - a. Matching			: Please Choose Expected match
 *              b. Upload video	: Please Choose Video
 * @five  : 5 - Preview your Advert
 * @six   : 6 - Summary of your bill
 * @seven : 7 - Payment Verification - Thank You
 */
export enum stepAdvertForm {
  one   = 1,
  two   = 2,
  three = 3,
  four  = 4,
  five  = 5,
  six   = 6,
  seven = 7,
}

export const COLORS = [
  {
    value: 'Black',
    label: 'Black',
    i: 'bg-black'
  },
  {
    value: 'Blue',
    label: 'Blue',
    i: 'bg-blue-600'
  },
  {
    value: 'Red',
    label: 'Red',
    i: 'bg-red-600'
  },
  {
    value: 'Silver',
    label: 'Silver',
    i: 'bg-gray-300'
  },
  {
    value: 'Gold',
    label: 'Gold',
    i: 'bg-yellow-500'
  },
  {
    value: 'White',
    label: 'White',
    i: 'bg-white'
  },
  {
    value: 'Green',
    label: 'Green',
    i: 'bg-green-500'
  },
  {
    value: 'Brown',
    label: 'Brown',
    i: 'bg-[#AB9024]'
  },
  {
    value: 'Purple',
    label: 'Purple',
    i: 'bg-purple-600'
  },
  {
    value: 'Tosca',
    label: 'Tosca',
    i: 'bg-[#29B2A4]'
  },
  {
    value: 'Gun Metal',
    label: 'Gun Metal',
    i: 'bg-[#8E8E8E]'
  },
];

export const categoryGroups = {
  // CAR: [65540, 65538, 65537],
  CAR: [
    "00010004000000000000000000000000",
    "00010002000000000000000000000000",
    "00010001000000000000000000000000",
  ],

  // COLLECTIBLE: [524292, 524289, 524290, 524296],
  COLLECTIBLE: [
    "00080004000000000000000000000000",
    "00080001000000000000000000000000",
    "00080002000000000000000000000000",
    "00080008000000000000000000000000",
  ],

  // MOTORBIKE: [131074, 131073, 131076],
  MOTORBIKE: [
    "00020002000000000000000000000000",
    "00020001000000000000000000000000",
    "00020004000000000000000000000000",
  ],

  // TECHNOLOGY_DEVICE: [262160, 262148, 262145, 262152, 262146],
  TECHNOLOGY_DEVICE: [
    "00040010000000000000000000000000",
    "00040004000000000000000000000000",
    "00040001000000000000000000000000",
    "00040008000000000000000000000000",
    "00040002000000000000000000000000",
  ],
}

export const mimeImages = ['image/jpeg', 'image/png']; // , 'image/webp'

export const mimeVideos = ['video/mp4'];

// export const dummyLists = [1, 2, 3, 4].map(id => ({ id }));
