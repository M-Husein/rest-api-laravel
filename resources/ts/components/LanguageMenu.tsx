import type { MenuProps } from "antd";
import { Dropdown, Avatar, Button } from 'antd';
import { useGetLocale, useSetLocale, useTranslate, useNavigation, useUpdate } from "@refinedev/core"; // 
import { useTranslation } from "react-i18next";
import dayjs from 'dayjs';
// import { getAppLang } from '@/utils/setAppLang'; // setAppLang, 

const renderFlag = (lang: string | undefined, size: number) => (
  <Avatar
    size={size}
    shape="square"
    alt={lang}
    src={`/media/img/flags/lang-${lang}.svg`}
  />
);

export const LanguageMenu = ({
  user,
  overlayStyle,
}: any) => {
  const { i18n } = useTranslation();
  const locale = useGetLocale();
  const currentLocale = locale();
  const changeLanguage = useSetLocale();
  const translate = useTranslate();
  const { replace } = useNavigation();
  const { mutate, isPending } = useUpdate();

  // console.log('user: ', user);

  const changeLocale = (lang: string) => {
    if(user?.authenticated){
      mutate({
        resource: "users", // users/language
        id: "language",
        values: { lang },
        meta: {
          keepalive: true,
        },
        successNotification: () => false,
      }); 
    }

    dayjs.locale(lang);
    changeLanguage(lang);

    let { pathname, search } = window.location;
    // console.log('pathname: ', pathname);
    // console.log('search: ', search);

    // replace(
    //   // pathname + (lang === APP.defaultLang ? search : (search ? search + "&" : "?") + "lang=" + lang)
    //   pathname + (lang === APP.defaultLang ? "" : (search ? search + "&" : "?") + "lang=" + lang)
    // );

    let params: any;

    if(lang === APP.defaultLang){
      params = new URLSearchParams(search);
      params.delete('lang');
      params = "?" + params.toString();
    }else{
      params = (search ? search + "&" : "?") + "lang=" + lang;
    }

    replace(pathname + params);
    document.documentElement.lang = lang;

    // window.location.replace(
    //   pathname + (lang === APP.defaultLang ? "" : (search ? search + "&" : "?") + "lang=" + lang)
    // );

    // window.location.replace(pathname + params);

    // if(window.confirm('Are You sure to change App language? App will reload.')){
      
    // }
  }

  const languageOptions: MenuProps["items"] = [...(i18n.languages || [])]
    .sort()
    .map((lang: string) => ({
      key: lang,
      icon: renderFlag(lang, 16),
      // @ts-ignore
      label: APP.locales[lang],
      onClick: () => changeLocale(lang),
    }));

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{
        items: languageOptions,
        selectedKeys: currentLocale ? [currentLocale] : [],
      }}
      getPopupContainer={(triggerNode: any) => triggerNode.parentElement}
      overlayStyle={overlayStyle}
    >
      <Button
        className="flex items-center px-1"
        title={translate("language")}
        disabled={isPending}
      >
        {renderFlag(currentLocale, 22)}
      </Button>
    </Dropdown>
  );
}
