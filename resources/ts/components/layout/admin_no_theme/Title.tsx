import { Link } from "react-router-dom";
// import { theme } from "antd";

// React.FC<RefineLayoutThemedTitleProps>
export const Title: React.FC<any> = ({
  collapsed,
  icon,
  text,
}) => {
  return (
    <Link
      to="/" // /dashboard
      className="inline-flex"
    >
      {icon}

      {text && (
        <strong 
          // style={{ color: token.colorText }} // colorTextBase
          className="text-base ml-2"
          hidden={collapsed}
          translate="no"
        >
          {text}
        </strong>
      )}
    </Link>
  );
};
