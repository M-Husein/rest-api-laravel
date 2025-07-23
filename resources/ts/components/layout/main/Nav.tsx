import type { MenuProps } from 'antd';
// import type { IUser } from '@/types/Types';
import { useRef } from "react"; // useEffect, 
import { Menu, Button, Skeleton, Avatar, Modal } from 'antd'; // , Dropdown, Button, 
// import { UserOutlined } from '@ant-design/icons'; // SettingOutlined, 
import { useLocation, NavLink } from 'react-router-dom';
import { useGetIdentity, useLogout } from "@refinedev/core"; // useLogout, useWarnAboutChange, useTranslate
import { UserOutlined } from '@ant-design/icons';
import { LanguageMenu } from '@/components/LanguageMenu';
import { useApp } from '@/contexts/app/Context';
// import { useLogout } from '@/utils/hooks/useLogout';
import { useLogoutAlert } from '@/utils/hooks/useLogoutAlert';

const MENUS: MenuProps['items'] = [
  {
    key: '/',
    label: (
      <NavLink to="/" className="block">
        <img 
          height={29}
          alt={import.meta.env.VITE_APP_NAME} 
          src="/logo-32x32.png"
        />
      </NavLink>
    ),
    className: "after-no leading-normal",
    style: { marginRight: 'auto' },
  },
  {
    key: '/contact-us',
    label: (
      <NavLink to="/contact-us" className="p-2">
        Contact Us
      </NavLink>
    ),
  },
];

const languageMenu = (user: any) => ({
  key: 'lang',
  label: <LanguageMenu user={user} />,
  className: "after-no",
});

export const Nav = ({ loading, user }:  any) => {
  const { user: currentUser } = useApp(); // , setUser
  const { data, isLoading } = useGetIdentity<any>(); // IUser
  const userData = currentUser || data || user;
  const location = useLocation();
  // const { logout, modalContextHolder } = useLogout();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const { mutate: logout } = useLogout();
  const navRef = useRef<any>();

  // console.log('Nav loading: ', loading)
  // console.log('Nav isLoading: ', isLoading)
  // console.log('props user: ', user);
  // console.log('currentUser: ', currentUser);
  // console.log('data: ', data);
  // console.log('userData: ', userData);
  // console.log('==================================================================================')

  useLogoutAlert(modalApi);

  /** @NOTE : Add loading menu */
  const parseMenus = () => {
    // let isAuthenticated = user?.authenticated;

    // if(!isAuthenticated || isLoading){
    //   return [];
    // }

    if(loading || isLoading){
      return [
        ...MENUS,
        {
          key: '1',
          label: <Skeleton.Button active style={{ width: 32, minWidth: 32 }} />,
          className: "after-no leading-normal",
        },
        languageMenu(userData),
      ];
    }

    if(userData && user?.authenticated){
      let userMenus = [
        {
          key: "/settings",
          label: <NavLink to="/settings">Settings</NavLink>,
        },
        {
          label: "Log Out",
          onClick: logout,
        },
      ];

      if(userData.role === 1){
        userMenus = [
          {
            key: "/app",
            label: <NavLink to="/app" rel="nofollow noopener noreferrer">Dashboard</NavLink>,
          },
          ...userMenus
        ];
      }

      return [
        ...MENUS,
        {
          key: "user",
          label: (
            <Button className="!p-0 border-gray-400">
              <Avatar
                size={30}
                shape="square"
                icon={<UserOutlined />}
                src={userData.avatar}
                alt={userData.username || userData.name}
                style={{ display: 'flex' }}
              />
            </Button>
          ),
          className: "after-no leading-normal",
          popupOffset: [-130, 0],
          children: userMenus,
        },
        languageMenu(userData),
      ];
    }

    return [
      ...MENUS,
      {
        key: '/auth/login',
        label: (
          <NavLink
            to="/auth/login"
            className="text-gray-800 font-bold p-2 rounded-lg"
          >
            Login
          </NavLink>
        ),
      },
      {
        key: '/auth/register',
        label: (
          <NavLink
            to="/auth/register"
            className="text-gray-800 font-bold p-2 rounded-lg"
          >
            Register
          </NavLink>
        ),
      },
      languageMenu(userData),
    ];
  }

  return (
    <header className="bg-main h-14 w-full border-b border-zinc-300 !sticky top-0 z-1051">
      <nav 
        ref={navRef}
        className="h-full px-2 xl_max-w-screen-xl mx-auto relative"
      >
        <Menu 
          id="navMain"
          mode="horizontal"
          triggerSubMenuAction="click"
          style={{ borderBottom: 0 }}
          className="h-full items-center bg-main"
          items={parseMenus()}
          selectedKeys={location.pathname !== '/' ? [location.pathname] : []}
          getPopupContainer={() => navRef.current}
        />
      </nav>

      {modalContextHolder}
    </header>
  );
}
