import type { MenuProps } from "antd";
import { Dropdown, Avatar, Button } from 'antd';
import { useGetLocale, useSetLocale, useTranslate, useUpdate } from "@refinedev/core"; // 
import { useTranslation } from "react-i18next";
import dayjs from 'dayjs';
import { setZodLocale } from '@/utils/locale/setZodLocale';

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
  const { mutate, isPending } = useUpdate();

  // console.log('user: ', user);

  const changeLocale = async (lang: string) => {
    // Only hit by user logged.
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
    document.documentElement.lang = lang;
    await setZodLocale(lang);
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
