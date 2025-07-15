import { HomeOutlined, UserOutlined, SettingOutlined, UsergroupAddOutlined, ToolOutlined } from '@ant-design/icons';
// import { TbBowlSpoon } from "react-icons/tb";
// import { ImSpoonKnife } from "react-icons/im";
import { LuUserRoundCog, LuFlag } from "react-icons/lu";
import { GrCurrency } from "react-icons/gr";
import { PiMapPinAreaFill, PiCity } from "react-icons/pi";

export const RESOURCES: any = [
  {
    name: "home",
    list: "/", // /admin
    meta: { label: "Home", icon: <HomeOutlined /> }
  },
  // {
  //   name: "advert",
  //   list: "/adverts",
  //   meta: { label: "Adverts" }
  // },
  {
    name: "currency", // @ts-ignore
    entity_name: "currency",
    list: "/currencies",
    meta: { label: "Currencies", icon: <GrCurrency /> }
  },
  {
    name: "country", // @ts-ignore
    entity_name: "country",
    list: "/country",
    meta: { label: "Country", icon: <LuFlag /> }
  },
  {
    name: "province", // @ts-ignore
    entity_name: "province",
    list: "/province",
    meta: { label: "Province", icon: <PiMapPinAreaFill /> }
  },
  {
    name: "city", // @ts-ignore
    entity_name: "city",
    list: "/city",
    meta: { label: "City", icon: <PiCity /> }
  },
  {
    name: "settings",
    meta: { icon: <SettingOutlined /> }, // label: "Settings", 
  },
  {
    name: "app",
    list: "/settings/app",
    meta: { parent: "settings", label: "App", icon: <ToolOutlined /> },
  },
  {
    name: "application_user", // @ts-ignore
    entity_name: "application_user",
    list: "/settings/users", // /admin/users
    meta: { parent: "settings", label: "Users", icon: <UserOutlined /> },
  },
  {
    name: "team", // @ts-ignore
    entity_name: "team",
    list: "/settings/teams", // /admin/users
    meta: { parent: "settings", label: "Teams", icon: <UsergroupAddOutlined /> },
  },
  {
    name: "role_access", // @ts-ignore
    entity_name: "role_access",
    list: "/settings/roles-permissions", // /admin/roles-permissions
    meta: { parent: "settings", label: "Roles & Permissions", icon: <LuUserRoundCog /> },
  },
];
