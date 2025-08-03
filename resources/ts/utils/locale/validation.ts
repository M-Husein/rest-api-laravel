import * as z from "zod";
// import { z } from "zod";
import i18n from "@/i18n";

const error = () => {
  const toHave = i18n.t('z.toHave');
  const items = i18n.t('z.items');

  const Sizable = {
    string: { unit: i18n.t('z.char'), verb: toHave },
    file: { unit: i18n.t('z.bytes'), verb: toHave },
    array: { unit: items, verb: toHave },
    set: { unit: items, verb: toHave },
  };

  function getSizing(origin: 'string' | 'file' | 'array' | 'set'){
    return Sizable[origin] ?? null;
  }

  const Nouns: any = {
    regex: "input",
    email: i18n.t('z.email'),
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: i18n.t('z.datetime'),
    date: i18n.t('z.date'),
    time: i18n.t('z.time'),
    duration: i18n.t('z.duration'),
    ipv4: i18n.t('z.ipv4'),
    ipv6: i18n.t('z.ipv6'),
    cidrv4: i18n.t('z.cidrv4'),
    cidrv6: i18n.t('z.cidrv6'),
    base64: i18n.t('z.base64'),
    base64url: i18n.t('z.base64url'),
    json_string: i18n.t('z.json_string'),
    e164: i18n.t('z.e164'),
    jwt: "JWT",
    template_literal: "input",
  };

  return (issue: any) => {
    switch (issue.code){
      case "invalid_type":
        // return // `Invalid input: expected ${issue.expected}, received ${parsedType(issue.input)}`;
        return i18n.t('error.required');

      case "invalid_value":
        if(issue.values.length === 1){
          // return `Invalid input: expected ${stringifyPrimitive(issue.values[0])}`;
          return i18n.t('z.invalid_input', { v: stringifyPrimitive(issue.values[0]) });
        }
        // return `Invalid option: expected one of ${joinValues(issue.values, "|")}`;
        return i18n.t('z.invalid_option', { v: joinValues(issue.values, "|") });

      case "too_big": {
        const adj = issue.inclusive ? "<=" : "<";
        const sizing = getSizing(issue.origin);

        const sameValue: any = { 
          e: issue.origin ?? "value", 
          v: adj + issue.maximum.toString(),
        };

        if(sizing){
          // return `Too big: expected ${issue.origin ?? "value"} to have ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
          return i18n.t('z.too_big1', { 
            ...sameValue,
            u: sizing.unit ?? "elements"
          }) as string;
        }
        // return `Too big: expected ${issue.origin ?? "value"} to be ${adj}${issue.maximum.toString()}`;
        return i18n.t('z.too_big2', sameValue) as string;
      }

      case "too_small": {
        // const adj = issue.inclusive ? ">=" : ">";
        // const sizing = getSizing(issue.origin);
        // if(sizing){
        //   return `Too small: expected ${issue.origin} to have ${adj}${issue.minimum.toString()} ${sizing.unit}`;
        // }
        // return `Too small: expected ${issue.origin} to be ${adj}${issue.minimum.toString()}`;

        return i18n.t('error.minLength', { v: issue.minimum });
      }

      case "invalid_format": {
        const _issue = issue;
        if(_issue.format === "starts_with"){
          // return `Invalid string: must start with "${_issue.prefix}"`;
          return i18n.t('z.invalid_format.starts_with', { v: _issue.prefix });
        }
        if(_issue.format === "ends_with"){
          // return `Invalid string: must end with "${_issue.suffix}"`;
          return i18n.t('z.invalid_format.ends_with', { v: _issue.suffix });
        }
        if(_issue.format === "includes"){
          // return `Invalid string: must include "${_issue.includes}"`;
          return i18n.t('z.invalid_format.includes', { v: _issue.includes });
        }
        if(_issue.format === "regex"){
          // return `Invalid string: must match pattern ${_issue.pattern}`;
          return i18n.t('z.invalid_format.regex', { v: _issue.pattern });
        }
        // return `Invalid ${Nouns[_issue.format] ?? issue.format}`;
        return i18n.t('z.invalid_format.format', { v: _issue.format });
      }

      case "not_multiple_of":
        // return `Invalid number: must be a multiple of ${issue.divisor}`;
        return i18n.t('z.not_multiple_of', { v: issue.divisor });

      case "unrecognized_keys":
        // return `Unrecognized key${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
        return i18n.t('z.unrecognized_keys', { v: joinValues(issue.keys, ", ") });

      case "invalid_key":
        // return `Invalid key in ${issue.origin}`;
        return i18n.t('z.invalid_key', { v: issue.origin });

      // case "invalid_union":
      //   // return "Invalid input";
      //   return i18n.t('z.invalid_union');

      case "invalid_element":
        // return `Invalid value in ${issue.origin}`;
        return i18n.t('z.invalid_element', { v: issue.origin });

      default:
        // return `Invalid input`;
        return i18n.t('z.invalid_union');
    }
  };
};

// FROM import * as util from "zod/v4/core/utils.js";
const stringifyPrimitive = (value: any) => {
  if(typeof value === "bigint"){
    return value.toString() + "n";
  }
  if(typeof value === "string"){
    return `"${value}"`;
  }
  return `${value}`;
}

const joinValues = (array: any, separator = "|") => {
  // return array.map((val: any) => stringifyPrimitive(val)).join(separator);
  return array.map(stringifyPrimitive).join(separator);
}

// export const parsedType = (data: any) => {
//   const t = typeof data;
//   switch (t){
//     case "number": {
//       return Number.isNaN(data) ? "NaN" : "number";
//     }
//     case "object": {
//       if(Array.isArray(data)){
//         return "array";
//       }
//       if(data === null){
//         return "null";
//       }
//       if(Object.getPrototypeOf(data) !== Object.prototype && data.constructor){
//         return data.constructor.name;
//       }
//     }
//   }
//   return t;
// };

export const zodConfig = () => z.config({
  localeError: error()
});

// export default function validation(){
//   return {
//     localeError: error(),
//   };
// }
