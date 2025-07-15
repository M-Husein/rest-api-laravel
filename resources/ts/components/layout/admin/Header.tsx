import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
// import type { IUser } from '@/types/Types';
import { useGetIdentity, useWarnAboutChange, useTranslate, useLogout } from "@refinedev/core";
import { Layout, Dropdown, Button, Switch, Avatar, Modal } from "antd"; // Badge,
import { UserOutlined } from '@ant-design/icons'; // , MoonFilled, SunFilled, SettingOutlined
import { useLocation, NavLink } from "react-router-dom";
import { useAppTheme } from "@/contexts/app/Context";
import { LanguageMenu } from '@/components/LanguageMenu';
import { useLogoutAlert } from '@/utils/hooks/useLogoutAlert';

const overlayStyle = {
  left: 'auto',
  right: 0
};

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = () => {
  const { data: currentUser } = useGetIdentity<any>(); // IUser
  const { mutate: mutateLogout } = useLogout();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const translate = useTranslate();

  const { name, username, email, avatar } = currentUser || {};
  const fixName = name || username;

  const { theme, setTheme } = useAppTheme();
  const location = useLocation();

  useLogoutAlert(modalApi);

  const doLogout = () => {
    if (warnWhen) {
      if (window.confirm(translate("warnWhenUnsavedChanges"))) {
        setWarnWhen(false);
        mutateLogout();
      }
    } else {
      mutateLogout();
    }
  }

  return (
    <Layout.Header
      style={{ padding: '0 14px' }}
      // bg-blue-100 | bg-main
      className="bg-nav !sticky h-12 flex items-center top-0 z-1051 shadow"
      id="navMain"
    >
      <div className="relative h-12 ml-auto flex items-center">
        <Switch
          checkedChildren="🌛" // <MoonFilled />
          unCheckedChildren="🔆" // <SunFilled />
          onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
          defaultChecked={theme === "dark"}
        />
        
        <div className="relative mx-3">
          <LanguageMenu
            overlayStyle={overlayStyle}
          />
        </div>

        <Dropdown
          getPopupContainer={(triggerNode: any) => triggerNode.parentElement}
          overlayStyle={overlayStyle}
          trigger={['click']}
          placement="bottomRight"
          menu={{
            selectable: true,
            selectedKeys: [location.pathname],
            items: [
              {
                key: "/settings", // my-profile
                label: (
                  <NavLink 
                    to="/settings"
                    className="flex items-center justify-center"
                  >
                    <Avatar
                      size={55}
                      shape="square"
                      icon={<UserOutlined />}
                      src={avatar}
                      alt={fixName}
                      style={{ fontSize: 29 }}
                    />
                    <section className="w-48 ml-3">
                      {!!fixName && (
                        <h1 className="text-lg mb-0 leading-6">
                          {fixName}
                        </h1>
                      )}
                      
                      {email && (
                        <div className="text-sm text-gray-500 truncate">
                          {email}
                        </div>
                      )}

                      {/* <Badge
                        // color="#ff7a00"
                        count="View Profile"
                        className="mt-1"
                      /> */}
                    </section>
                  </NavLink>
                )
              },
              {
                type: "divider"
              },
              {
                key: 2,
                label: "Logout",
                onClick: doLogout
              }
            ],
          }}
        >
          <Button className="!p-0 border-gray-400">
            <Avatar
              size={30}
              shape="square"
              icon={<UserOutlined />}
              src={avatar}
              alt={fixName}
              style={{ display: 'flex' }}
            />
          </Button>
        </Dropdown>
      </div>

      {modalContextHolder}
    </Layout.Header>
  );
};
