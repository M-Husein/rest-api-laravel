import { GoogleOutlined } from '@ant-design/icons'; // , LinkedinFilled, FacebookFilled

const style = {
  fontSize: 18,
  lineHeight: 0,
};

// const socialOptions: { [key: string]: any } = {
//   google: {
//     label: "Sign in with Google",
//     icon: (
//       <GoogleOutlined
//         style={style}
//       />
//     ),
//   },
//   linkedin: {
//     label: "Sign in with Linkedin",
//     icon: (
//       <LinkedinFilled
//         style={style}
//       />
//     ),
//   }
// };

// export const socialsProvider = APP.socials.map((name: string) => ({ name, ...socialOptions[name] }));

export const socialsProvider = [
  {
    name: "google",
    label: "Sign in with Google",
    icon: (
      <GoogleOutlined
        style={style}
      />
    ),
  },
  // {
  //   name: "linkedin",
  //   label: "Sign in with Linkedin",
  //   icon: (
  //     <LinkedinFilled
  //       style={style}
  //     />
  //   ),
  // },
  // {
  //   name: "facebook",
  //   label: "Sign in with Facebook",
  //   icon: (
  //     <FacebookFilled
  //       style={style}
  //     />
  //   ),
  // },
];
