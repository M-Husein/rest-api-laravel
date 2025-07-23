import dayjs from 'dayjs';

const dayjsLocaleManifest = import.meta.glob('../../../../node_modules/dayjs/locale/*.js');

export const setDayjsLocale = async (localeCode: string): Promise<void> => {
  try {
    const importLocale = dayjsLocaleManifest[`../../../../node_modules/dayjs/locale/${localeCode}.js`];

    if (importLocale) {
      await importLocale();
      dayjs.locale(localeCode);
      // console.log(`Day.js locale set to: ${localeCode}`);
    } 
    // else {
    //   console.warn(`Day.js locale '${localeCode}' not found.`);
    // }
  } catch (error) {
    console.error(`Failed to load Day.js locale '${localeCode}'. Error:`, error);
  }
}
