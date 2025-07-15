import { useState, useCallback, useDeferredValue } from "react";
import { Layout, Menu, Grid, Drawer, Button, Input } from "antd";
import { FaHouse, FaList, FaBars, FaCircleInfo } from "react-icons/fa6"; // , FaChevronLeft
// import { QuestionCircleFilled } from '@ant-design/icons'; // , SearchOutlined
import {
  useTitle,
  CanAccess,
  ITreeMenu,
  useMenu,
  useRefineContext,
  pickNotDeprecated,
  // useWarnAboutChange,
} from "@refinedev/core";
import { useThemedLayoutContext } from "@/utils/hooks/useThemedLayoutContext";
import { useLocation, Link } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { Title as TitleDefault } from './Title';
import { recursiveFilter } from '@/utils/recursive';

const width = 235;
const collapsedWidth = 60;
const appName = import.meta.env.VITE_APP_NAME;

export const Sider = ({
  theme: colorScheme,
  Title: TitleFromProps,
  render,
  meta,
  // activeItemDisabled = false,
}: any) => {
  const { siderCollapsed, setSiderCollapsed, mobileSiderOpen, setMobileSiderOpen } = useThemedLayoutContext();
  // const { warnWhen, setWarnWhen } = useWarnAboutChange();
  const TitleFromContext = useTitle();
  const { menuItems, selectedKey, defaultOpenKeys } = useMenu({ meta });
  const { hasDashboard } = useRefineContext();
  const location = useLocation();

  const breakpoint = Grid.useBreakpoint();
  const isMobile = typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const RenderToTitle = TitleFromProps ?? TitleFromContext ?? TitleDefault;

  const [searchOn, setSearchOn] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const deferredSearchValue = useDeferredValue(searchValue);
  const [searchResult, setSearchResult] = useState<any>([]);

  const renderTreeView = (tree: ITreeMenu[], selectedKey?: string) => {
    return tree.map((item: ITreeMenu) => {
      const { icon, label, route, key, name, children, parentName, meta, options } = item;

      if (children.length > 0) {
        return (
          <CanAccess
            key={key} // item.key
            resource={name.toLowerCase()}
            action="list"
            params={{
              resource: item,
            }}
          >
            <Menu.SubMenu
              key={key}
              icon={icon ?? <FaList />}
              title={label}
            >
              {renderTreeView(children, selectedKey)}
            </Menu.SubMenu>
          </CanAccess>
        );
      }

      const clickLink = (e: any, route: any) => {
        if(location.search && location.pathname === route){
          e.preventDefault();
          e.stopPropagation();
        }
      }

      const UNDEFINED = undefined;
      const isSelected = key === selectedKey;
      const isRoute = !(pickNotDeprecated(meta?.parent, options?.parent, parentName) !== UNDEFINED && children.length === 0);
      // const linkStyle: CSSProperties = activeItemDisabled && isSelected ? { pointerEvents: "none" } : {};
      const isActiveLink = isSelected ? "!cursor-auto" : UNDEFINED;

      return (
        <CanAccess
          key={key}
          resource={name.toLowerCase()}
          action="list"
          params={{
            resource: item,
          }}
        >
          <Menu.Item
            key={key}
            icon={icon ?? (isRoute && <FaList />)}
            // style={linkStyle}
            className={isActiveLink}
          >
            <Link
              to={route ?? ""}
              // style={linkStyle}
              className={isActiveLink}
              tabIndex={isSelected ? -1 : UNDEFINED}
              title={!isMobile && !siderCollapsed ? label : UNDEFINED}
              onClick={(e: any) => clickLink(e, route)}
            >
              {label}
            </Link>
            
            {!siderCollapsed && isSelected && (
              <div className="a-menu-tree-arrow" />
            )}
          </Menu.Item>
        </CanAccess>
      );
    });
  };

  const debouncedFilter = useCallback(debounce((val: string) => {
    const result = recursiveFilter(
      menuItems,
      (item: any) => item.label.toLowerCase().includes(val.toLowerCase())
    ) as [];

    setSearchResult(result);
    setSearchOn(false);

    /** @DEV_OPTION : Collapse all nested child */
    if(result.length){
      setTimeout(() => {
        document.querySelectorAll('.sider-menu [aria-expanded=false]')
          .forEach((item: any) => item.click());
      }, 9);
    }
  }, 500), []);

  const onFilterMenu = (e: any) => {
    e.stopPropagation();
    const val = e.target.value;
    setSearchValue(val);

    const valTrim = val.trim();
    if(valTrim){
      setSearchOn(true);
      debouncedFilter(valTrim);
      return;
    }
    setSearchResult([]);
  }

  const toggleSiderCollapse = (collapsed: boolean) => {
    setSiderCollapsed(collapsed);
    localStorage.setItem('asideMin', collapsed ? '1' : '0')
  }

  // @ts-ignore
  const onSearch = (val: any, e: any) => {
    e.stopPropagation();

    const isClick = e.type === "click";

    // Expand sider only large device
    if(!isMobile && siderCollapsed && isClick){
      // setSiderCollapsed(false);
      toggleSiderCollapse(false);
    }
    // Focus input search
    if(isClick && e.target.tagName !== "INPUT"){
      setTimeout(() => {
        document.getElementById('siderSearch')?.focus?.();
      }, 1);
    }
  }

  const dashboard = hasDashboard ? (
    <Menu.Item key="dashboard" icon={<FaHouse />}>
      <Link to="/dashboard">Dashboard</Link>
      {!siderCollapsed && selectedKey === "/" && <div className="a-menu-tree-arrow" />}
    </Menu.Item>
  ) : null;

  const searchValueTrim = !!deferredSearchValue.trim();
  const items = renderTreeView(searchValueTrim ? searchResult : menuItems, selectedKey);

  // console.log('items: ', searchValueTrim ? searchResult : menuItems);

  const renderSider = () => {
    if (render) {
      return render({
        dashboard,
        items,
        logout: null,
        collapsed: siderCollapsed,
      });
    }
    return (
      <>
        {dashboard}
        {items}
      </>
    );
  };

  const renderMenu = () => {
    return (
      <>
        <Input.Search
          allowClear
          variant="filled" // filled | borderless
          id="siderSearch"
          placeholder="Search"
          className="relative shadow overflow-hidden bg-white sider-search"
          value={searchValue}
          onChange={onFilterMenu}
          onSearch={onSearch}
          // suffix={<SearchOutlined />}
        />

        {!searchOn && searchValueTrim && !items.length && (
          <b className="text-center p-4" title="Not Found">
            <FaCircleInfo />
            {siderCollapsed ? "" : " Not Found"}
          </b>
        )}
        
        <Menu
          theme={colorScheme}
          mode="inline"
          inlineIndent={9}
          className="py-2 q-scroll scroll-hover border-0 overflow-auto overscroll-contain flex-1 sider-menu"
          // selectable={false}
          selectedKeys={selectedKey ? [selectedKey] : []}
          defaultOpenKeys={defaultOpenKeys}
          onClick={() => {
            isMobile && setMobileSiderOpen(false)
          }}
          // items={searchValueTrim ? searchResult : menuItems}
        >
          {renderSider()}
        </Menu>
      </>
    );
  };

  const renderDrawerSider = () => {
    return (
      <>
        <Drawer
          open={mobileSiderOpen}
          onClose={() => setMobileSiderOpen(false)}
          placement="left"
          closable={false}
          width={275}
          styles={{
            body: { padding: 0, overflow: 'unset' }
          }}
          maskClosable
          rootClassName="z-1052 drawerMain siderMain"
        >
          <Layout>
            <Layout.Sider
              theme={colorScheme}
              width={275}
              style={{
                height: '100vh',
              }}
            >
              {renderMenu()}
            </Layout.Sider>
          </Layout>
        </Drawer>
        
        <div className="!fixed top-0 z-1052 h-12 flex items-center gap-x-2">
          <Button
            type="text"
            size="large"
            icon={<FaBars />} //  className="text-white"
            onClick={() => setMobileSiderOpen(true)}
          />

          <Link 
            to="/" 
            className="py-2 px-1 font-bold" // text-white
          >
            <img 
              width={24} 
              height={24} 
              src="/logo-36x36.png" 
              alt={appName} 
              className="mr-2"
              loading="lazy"
              decoding="async"
            />
            {appName}
          </Link>
        </div>
      </>
    );
  };

  if (isMobile) {
    return renderDrawerSider();
  }

  const widthSider = siderCollapsed ? collapsedWidth : width;

  return (
    <>
      <div
        style={{
          width: widthSider,
          transition: 'all .2s',
        }}
      />

      <Layout.Sider
        theme={colorScheme}
        className="!fixed top-0 z-1051 h-screen siderMain" //  bg-nav
        id="asideMain"
        collapsible
        collapsed={siderCollapsed}
        onCollapse={(collapsed, type) => {
          // type === "clickTrigger" && setSiderCollapsed(collapsed)
          type === "clickTrigger" && toggleSiderCollapse(collapsed)
        }}
        width={width}
        collapsedWidth={collapsedWidth}
        breakpoint="lg"
        // trigger={null}
        // trigger={
        //   <Button
        //     type="text"
        //     block
        //     style={{
        //       borderRadius: 0,
        //       height: "100%",
        //       width: "100%",
        //     }}
        //   >
        //     <FaChevronLeft className={siderCollapsed ? "rotate-180" : ""} />
        //   </Button>
        // }
      >
        <div
          style={{ 
            width: widthSider,
            // backgroundColor: '#01aae6',
          }}
          className={(siderCollapsed ? "!p-0 justify-center" : "p-4 justify-start") + " bg-nav flex items-center h-12 shadow relative z-2"}
        >
          <RenderToTitle collapsed={siderCollapsed} />
        </div>
        
        {renderMenu()}
      </Layout.Sider>
    </>
  );
}
