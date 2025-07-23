import * as z from "zod";

const localeManifest = import.meta.glob('../../../../node_modules/zod/v4/locales/*.js');

export const setZodLocale = async (localeCode: string): Promise<void> => {
  try {
    // Find the dynamic import function from the manifest
    const importLocale = localeManifest[`../../../../node_modules/zod/v4/locales/${localeCode}.js`];

    if (importLocale) {
      // Execute the function to get the module and set the locale
      const { default: locale }: any = await importLocale();
      if(locale){
        z.config(locale());
      }
    } else {
      console.warn(`Locale '${localeCode}' not found in manifest.`);
    }
  } catch (error) {
    console.warn(`Failed to load locale '${localeCode}'. Error:`, error);
  }
}
