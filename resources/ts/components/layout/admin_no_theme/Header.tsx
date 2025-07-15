import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
// import type { IUser } from '@/types/Types';
import { useGetIdentity, useLogout, useWarnAboutChange } from "@refinedev/core";
import {
  Avatar,
  Layout,
  Space,
  Dropdown,
  Button,
  Modal,
  // Badge,
} from "antd";
import { UserOutlined } from '@ant-design/icons';
// import { useLocation } from "react-router-dom"; // NavLink
import { useLogoutAlert } from '@/utils/hooks/useLogoutAlert';

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = () => {
  // const location = useLocation();
  const { mutate: mutateLogout } = useLogout();
  const { warnWhen, setWarnWhen } = useWarnAboutChange();
  const [modalApi, modalContextHolder] = Modal.useModal();
  
  const { data: currentUser } = useGetIdentity<any>(); // IUser
  const { avatar, email, email_address, username, application_username } = currentUser || {};

  useLogoutAlert(modalApi);

  const doLogout = () => {
    if (warnWhen) {
      if (window.confirm("Are you sure you want to leave? You have unsaved changes")) {
        setWarnWhen(false);
        mutateLogout();
      }
    } else {
      mutateLogout();
    }
  }

  const renderAvatar = (props?: any) => (
    <Avatar
      {...props}
      icon={<UserOutlined />}
      src={avatar}
      alt="&#128100;"
    />
  );

  return (
    <Layout.Header
      style={{ padding: '0 24px' }}
      className="bg-nav !sticky h-12 flex items-center top-0 z-1051 shadow"
      id="navMain"
    >
      <Space size={16} className="relative ml-auto">
        <Dropdown
          getPopupContainer={(triggerNode: any) => triggerNode.parentElement}
          overlayClassName="!left-auto !right-0"
          trigger={['click']}
          placement="bottomRight"
          menu={{
            // selectable: false, // true
            // selectedKeys: [location.pathname],
            items: [
              {
                key: "1", // /profile
                className: "!cursor-auto",
                label: (
                  <div // NavLink
                    // to="/admin/profile"
                    className="flex items-center justify-center"
                  >
                    {renderAvatar({ size: 65, className: "flex-none" })}

                    <section className="w-48 ml-3">
                      {!!(username || application_username) && (
                        <h1 className="text-xl mb-0 leading-6">
                          {username || application_username}
                        </h1>
                      )}
                      
                      {!!(email || email_address) && (
                        <p className="text-sm mb-0 text-gray-500 truncate">
                          {email || email_address}
                        </p>
                      )}

                      {/* <Badge
                        color="#054586"
                        count="View Profile"
                        className="mt-1"
                      /> */}
                    </section>
                  </div>
                )
              },
              {
                // key: '2',
                type: "divider",
              },
              {
                key: '2', // 3
                label: "Logout",
                onClick: doLogout
              }
            ],
          }}
        >
          <Button 
            type="text"
            className="flex items-center h-full !p-0"
            icon={renderAvatar()}
          />
        </Dropdown>
      </Space>

      {modalContextHolder}
    </Layout.Header>
  );
}
