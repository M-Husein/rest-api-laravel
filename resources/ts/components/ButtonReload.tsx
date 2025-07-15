import { Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

export const ButtonReload = ({
  ghost = !0,
  type = "primary",
  icon,
  title,
  ...etc
}: any) => (
  <Button 
    {...etc}
    ghost={ghost}
    type={type}
    icon={icon || <ReloadOutlined />}
    title={title || "Reload"}
  />
);
