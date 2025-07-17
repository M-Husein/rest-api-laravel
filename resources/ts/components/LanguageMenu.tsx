import type { MenuProps } from "antd";
import { Dropdown, Avatar, Button } from 'antd';
import { useGetLocale, useSetLocale, useTranslate } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import dayjs from 'dayjs';

const renderFlag = (lang: string | undefined, size: number) => (
  <Avatar
    size={size}
    shape="square"
    alt={lang}
    src={`/media/img/flags/lang-${lang}.svg`}
  />
);

export const LanguageMenu = ({
  overlayStyle,
}: any) => {
  const { i18n } = useTranslation();
  const locale = useGetLocale();
  const currentLocale = locale();
  const changeLanguage = useSetLocale();
  const translate = useTranslate();

  const languageOptions: MenuProps["items"] = [...(i18n.languages || [])]
    .sort()
    .map((lang: string) => ({
      key: lang,
      onClick: () => {
        dayjs.locale(lang);
        changeLanguage(lang);
      },
      icon: renderFlag(lang, 16),
      // @ts-ignore
      label: APP.locales[lang],
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
        className="flex items-center px-1" //  !p-0
        title={translate("language")}
      >
        {renderFlag(currentLocale, 22)}
      </Button>
    </Dropdown>
  );
}
