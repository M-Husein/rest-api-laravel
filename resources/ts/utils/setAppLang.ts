type setAppLangType = { ['lang']: string } | undefined;

export const setAppLang = (): setAppLangType => {
  // const lang = getAppLang()
  const lang = new URLSearchParams(location.search).get('lang') as string;

  if(lang){
    return { lang };
  }
}

type getAppLangType = {
  ['obj']: setAppLangType,
  ['str']: string,
};

/**
 * 
 * @return obj: { ['lang']: string } | undefined,
 * @return str: "?lang=" + obj.lang | ""
 */
export const getAppLang = (): getAppLangType => {
  const obj = setAppLang();
  return {
    obj,
    str: obj ? "?lang=" + obj.lang : ""
  }
}

// export const getAppLang = () => new URLSearchParams(location.search).get('lang') as string;
