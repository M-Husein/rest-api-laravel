// import { useRouterContext, useRouterType, useLink } from "@refinedev/core";
import { Link } from "react-router-dom";
import { theme } from "antd"; // Typography, Space
// import { RefineLayoutThemedTitleProps } from "../types";

// React.FC<RefineLayoutThemedTitleProps>
export const Title: React.FC<any> = ({
  collapsed,
  icon,
  text,
  // wrapperStyles,
}) => {
  // const { token } = theme.useToken();
  // const routerType = useRouterType();
  // const Link = useLink();
  // const { Link: LegacyLink } = useRouterContext();
  // const ActiveLink = routerType === "legacy" ? LegacyLink : Link;

  return (
    <Link
      to="/" // /admin/dashboard
      className="inline-flex txt-main"
    >
      {icon}

      <b 
        // style={{ color: token.colorText }} // colorTextBase
        className="ml-2 text-base"
        hidden={collapsed}
        translate="no"
      >
        {text}
      </b>
    </Link>
  );
};
