import { GoogleOutlined, FacebookFilled } from '@ant-design/icons';

const style = {
  fontSize: 18,
  lineHeight: 0,
};

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
  {
    name: "facebook",
    label: "Sign in with Facebook",
    icon: (
      <FacebookFilled
        style={style}
      />
    ),
  },
];
