import { useState, useCallback, useDeferredValue } from "react"; // useEffect
import { Layout, Menu, Grid, Drawer, Button, Input } from "antd";
import { FaHouse, FaList, FaBars } from "react-icons/fa6"; // FaCircleInfo, FaChevronLeft
// import { QuestionCircleFilled } from '@ant-design/icons';
import {
  // useTranslate,
  useTitle,
  CanAccess,
  ITreeMenu,
  useMenu,
  useRefineContext,
  pickNotDeprecated,
} from "@refinedev/core";
import { useThemedLayoutContext } from "@/utils/hooks/useThemedLayoutContext";
import { useLocation, Link } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { Title as TitleDefault } from './Title';
import { recursiveFilter } from '@/utils/recursive';

const width = 230;
const collapsedWidth = 55;

export const Sider = ({
  appName,
  theme: colorScheme,
  Title: TitleFromProps,
  render,
  meta,
  // activeItemDisabled = false,
}: any) => {
  const { siderCollapsed, setSiderCollapsed, mobileSiderOpen, setMobileSiderOpen } = useThemedLayoutContext();
  const TitleFromContext = useTitle();
  // const translate = useTranslate();
  const { menuItems, selectedKey, defaultOpenKeys } = useMenu({ meta });

  // const [openKeys, setOpenKeys] = useState<any>();

  const { hasDashboard } = useRefineContext();
  const location = useLocation();

  const breakpoint = Grid.useBreakpoint();
  const isMobile = typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

  const RenderToTitle = TitleFromProps ?? TitleFromContext ?? TitleDefault;

  const [searchOn, setSearchOn] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const deferredSearchValue = useDeferredValue(searchValue);
  const [searchResult, setSearchResult] = useState<any>([]);

  const clickLink = (e: any, route: any) => {
    if(location.search && location.pathname === route){
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const renderTreeView = (tree: ITreeMenu[], selectedKey?: string) => {
    return tree.map((item: ITreeMenu) => {
      const { icon, label, route, key, name, children, parentName, meta, options } = item;

      if (children.length) { // children.length > 0
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

      const isSelected = key === selectedKey;
      const isRoute = !(pickNotDeprecated(meta?.parent, options?.parent, parentName) !== undefined && children.length === 0);
      // const linkStyle: CSSProperties = activeItemDisabled && isSelected ? { pointerEvents: "none" } : {};
      const isActiveLink = isSelected ? { cursor: 'auto' } : undefined;

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
            style={isActiveLink}
          >
            <Link
              to={route ?? ""}
              style={isActiveLink}
              tabIndex={isSelected ? -1 : 0}
              title={!isMobile && !siderCollapsed ? label : undefined}
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
      {/* <Link to="/">{translate("dashboard.title")}</Link> */}
      <Link to="/">Dashboard</Link>
      {!siderCollapsed && selectedKey === "/" && <div className="a-menu-tree-arrow" />}
    </Menu.Item>
  ) : null;

  const searchValueTrim = !!deferredSearchValue.trim();
  const items: any = renderTreeView(searchValueTrim ? searchResult : menuItems, selectedKey);

  const renderSider = () => {
    if (render) {
      return render({
        dashboard,
        items,
        // logout: null,
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

  // console.log('items: ', items)

  const renderMenu = () => {
    return (
      <>
        <Input.Search
          allowClear
          // variant="borderless" // filled | borderless
          // size="large"
          id="siderSearch"
          placeholder="Search"
          autoComplete="off"
          // role="search"
          // inputMode="search"
          className="relative shadow overflow-hidden sider-search"
          value={searchValue}
          onChange={onFilterMenu}
          onSearch={onSearch}
        />

        {!searchOn && searchValueTrim && !items.length && (
          <b className="text-center p-4" title="Not Found">
            &#10060;
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
          // openKeys={siderCollapsed && !openKeys ? [] : openKeys || defaultOpenKeys}
          // onOpenChange={setOpenKeys}
          // items={items}
          onClick={() => {
            isMobile && setMobileSiderOpen(false)
          }}
        >
          {renderSider()}
        </Menu>

        <a 
          href="#"
          className={"truncate bg-nav rounded-lg m-2 p-1 " + (siderCollapsed ? "text-center" : "px-2")}
        >
          {/* <QuestionCircleFilled  /> */}
          &#10067;
          <b hidden={siderCollapsed} className="ml-2">DOCUMENTATION</b>
        </a>
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
              theme={colorScheme} // "light"
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
            icon={<FaBars />}
            onClick={() => setMobileSiderOpen(true)}
          />

          <Link to="/" className="py-2 px-1">
            <img width={24} height={24} src="/logo-36x36.png" alt={appName} />
          </Link>
        </div>
      </>
    );
  };

  if (isMobile) {
    return renderDrawerSider();
  }

  let widthSider = siderCollapsed ? collapsedWidth : width;

  return (
    <>
      <div
        style={{
          width: widthSider,
          transition: 'all .2s',
        }}
      />

      <Layout.Sider
        theme={colorScheme} // "light"
        className="!fixed top-0 z-1051 h-screen siderMain"
        id="asideMain"
        collapsible
        width={width}
        breakpoint="lg"
        collapsedWidth={collapsedWidth}
        collapsed={siderCollapsed}
        onCollapse={(collapsed, type) => {
          type === "clickTrigger" && toggleSiderCollapse(collapsed)
        }}
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
          style={{ width: widthSider }}
          className={(siderCollapsed ? "!p-0 justify-center" : "p-4") + " bg-nav flex items-center h-12 shadow relative z-2"}
        >
          <RenderToTitle collapsed={siderCollapsed} />
        </div>
        
        {renderMenu()}
      </Layout.Sider>
    </>
  );
};

/*
useEffect(() => {
  // console.log('defaultOpenKeys: ', defaultOpenKeys)
  console.log('selectedKey: ', selectedKey)
  console.log('siderCollapsed: ', siderCollapsed)

  setTimeout(() => {
    if(siderCollapsed){
      const asideMain: any = document.getElementById('asideMain');
      console.log('asideMain: ', asideMain)
      if(asideMain && selectedKey){
        // [aria-expanded=true] | .a-menu-submenu-open
        const activeMenu = asideMain.querySelector('[aria-expanded=true]');
        console.log('activeMenu: ', activeMenu)

        if(activeMenu){
          activeMenu.focus();

          // Event | MouseEvent
          // const mouseoverEvent = new Event('mouseenter'); // mouseover
          // activeMenu.dispatchEvent(new Event('mouseenter', {
          //   bubbles: true,
          //   cancelable: true,
          // }));
          // activeMenu.dispatchEvent(new Event('mouseover', {
          //   bubbles: true,
          //   cancelable: true,
          // }));

          setTimeout(() => {
            // activeMenu.dispatchEvent(new Event('mouseleave', {
            //   bubbles: true,
            //   cancelable: true,
            // }));

            activeMenu.blur();
          }, 9);
        }
      }
    }
  }, 350);
}, []);
*/