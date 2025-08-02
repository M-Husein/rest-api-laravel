import { Locale } from 'antd/es/locale';

export const getAntdLocale = async (localeCode: string): Promise<Locale | null> => {
  try {
    let importLocale: any;
    switch(localeCode){
      case "en":
        importLocale = () => import("antd/es/locale/en_US.js");
        break;
      case "id":
        importLocale = () => import("antd/es/locale/id_ID.js");
        break;
      default:
        break;
    }

    if (importLocale) {
      const { default: locale } = await importLocale() as { default: Locale };
      return locale;
    }
    return null;
  } catch { // (error)
    // console.error(`Failed to load Ant Design locale '${localeCode}'. Error:`, error);
    return null;
  }
}

// const antdLocaleManifest = import.meta.glob('../../../../node_modules/antd/es/locale/*.js');

// export const getAntdLocale = async (localeCode: string): Promise<Locale | null> => {
//   try {
//     let localeStr = localeCode;
//     switch(localeCode){
//       case "en":
//         localeStr += "_US";
//         break;
//       case "id":
//         localeStr += "_ID";
//         break;
//       default:
//         break;
//     }

//     const importLocale = antdLocaleManifest[`../../../../node_modules/antd/es/locale/${localeStr}.js`];

//     if (importLocale) {
//       const { default: locale } = await importLocale() as { default: Locale };
//       return locale;
//     }

//     // console.warn(`Ant Design locale '${localeCode}' not found.`);
//     return null;
//   } catch (error) {
//     console.error(`Failed to load Ant Design locale '${localeCode}'. Error:`, error);
//     return null;
//   }
// }
