export const setAppLang = (): { ['lang']: string } | {} => {
  const lang = new URLSearchParams(location.search).get('lang') as string;
  return lang ? { lang } : {};
}
