// import { useMemo } from "react";
import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
// import type { IUser } from '@/types/Types';
import { useGetIdentity, useWarnAboutChange, useTranslate, useLogout, useUpdate } from "@refinedev/core";
import { Layout, Dropdown, Button, Switch, Avatar, Modal } from "antd"; // Badge,
import { UserOutlined } from '@ant-design/icons'; // , MoonFilled, SunFilled, SettingOutlined
import { useLocation, NavLink } from "react-router-dom";
import { useAppTheme, useApp } from "@/contexts/app/Context";
import { LanguageMenu } from '@/components/LanguageMenu';
import { useLogoutAlert } from '@/utils/hooks/useLogoutAlert';

const overlayStyle = {
  left: 'auto',
  right: 0
};

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = () => {
  const { data: currentUser } = useGetIdentity<any>(); // IUser
  const { setUser } = useApp();
  const { mutate: mutateLogout, isPending: isPendingLogout } = useLogout();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const translate = useTranslate();
  const { mutate, isPending } = useUpdate();

  // const userData = useMemo(() => currentUser || {}, [currentUser]);
  const { name, username, email, avatar } = currentUser || {}; // userData
  const fixName = name || username;

  const { theme, setTheme } = useAppTheme();
  const location = useLocation();

  useLogoutAlert(modalApi);

  const doLogout = () => {
    if (warnWhen) {
      if (window.confirm(translate("warnWhenUnsavedChanges"))) {
        setWarnWhen(false);
        mutateLogout();
        setUser(null);
      }
    } else {
      mutateLogout();
      setUser(null);
    }
  }

  const changeTheme = () => {
    let themeValue = theme === "dark" ? "light" : "dark";
    mutate({
      resource: "users", // users/theme
      id: "theme",
      values: { theme: themeValue },
      meta: {
        keepalive: true
      },
      successNotification: () => false,
    });

    setTheme(themeValue);
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
          onChange={changeTheme}
          defaultChecked={theme === "dark"}
          loading={isPending}
        />
        
        <div className="relative mx-3">
          <LanguageMenu
            overlayStyle={overlayStyle}
            user={currentUser}
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
                disabled: isPendingLogout,
                onClick: doLogout
              }
            ],
          }}
        >
          <Button 
            type="text"
            // className="!p-0 border-gray-400"
            className="flex items-center h-full !p-0"
          >
            <Avatar
              size={30}
              shape="square"
              icon={<UserOutlined />}
              src={avatar}
              // src="https://api.dicebear.com/7.x/miniavs/svg?seed=1"
              alt={fixName}
              // crossOrigin="anonymous"
              style={{ display: 'flex' }}
            />
          </Button>
        </Dropdown>
      </div>

      {modalContextHolder}
    </Layout.Header>
  );
};
