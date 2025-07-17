export const setAppLang = (): { ['lang']: string } | undefined | {} => {
  const lang = new URLSearchParams(location.search).get('lang') as string;
  // return lang ? { lang } : {};
  if(lang){
    return { lang };
  }
}
