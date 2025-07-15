import { InfoCircleOutlined } from '@ant-design/icons';

export const Info = ({
  As = "div",
  prefixClass = "flex flex-col items-center",
  className,
  icon,
  children,
  ...etc
}: any) => {
  return (
    <As 
      {...etc}
      className={prefixClass + (className ? " " + className : "")}
    >
      {icon || <InfoCircleOutlined style={{ fontSize: 51, color: '#ff7a00' }} />}

      {children}
    </As>
  );
}
