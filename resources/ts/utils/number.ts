/**
 * @param num number
 * @returns boolean
 */
// export const isNumber = (num: any) => typeof num === 'number' && !isNaN(num);

// num && +num > 0 && +num < 10 ? '0' + +num : num
// num ? ('' + num).padStart(2, '0') : ''

// num && ('' + num).padStart(2, '0')
// export const numberPrefixZero = (num: any, targetLength = 2) => num ? ('' + num).padStart(targetLength, '0') : '';


/**
 * Intl.NumberFormat
 * @param value : number | bigint | string
 * @param options : object (Intl NumberFormat options)
 * @returns 
 */
export const numberFormat = (
  value: any, // number | bigint | string
  options?: any,
) => {
  // if(isNumber(value)){
  //   return new Intl.NumberFormat(options?.lang || "id", {
  //     style: "decimal",
  //     maximumFractionDigits: 4,
  //     ...options
  //   }).format(value);
  // }

  return new Intl.NumberFormat(options?.lang || "en", {
    style: "decimal",
    maximumFractionDigits: 4,
    ...options
  }).format(value);
}

/**
 * @param num number
 * @returns boolean
 */
// export const isNegative = (num: any) => Math.sign(num) === -1;
