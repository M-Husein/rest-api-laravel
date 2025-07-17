import { DataProvider } from "@refinedev/core";
// import { httpRequest, generateSort, generateFilter } from "./utils";
import { httpRequest } from "./utils/httpRequest";
import i18n from "@/i18n";
import { setAppLang } from '@/utils/setAppLang';

class CustomError extends Error { // @ts-ignore
  constructor(name: string, message: string, cause?: any) {
    super(message);
    this.name = name; // @ts-ignore
    this.cause = cause;
  }
}

type MethodTypes = "get" | "delete" | "head" | "options";
type MethodTypesWithBody = "post" | "put" | "patch";
type MethodCommons = "get" | "post" | "put" | "patch";

// const ERROR_UNSPECIFIC = "Terjadi kesalahan"; // Something went wrong

const parseFilters = (filters: any, query: any) => {
  if (filters?.length) {
    filters.forEach((f: any) => {
      query[`filter[${f.field}]`] = f.value;
    });
  }
}

const parseSorts = (sorters: any, query: any) => {
  if (sorters?.length) {
    query.sort = sorters.map((s: any) => s.order === "desc" ? `-${s.field}` : s.field).join(",");
  }
}

export const dataProvider = (
  apiUrl: string,
  httpClient = httpRequest,
): DataProvider => ({
  getList: async ({ 
    resource, 
    pagination, 
    filters, 
    sorters, 
    meta: { method, queryContext, searchParams, q, ...requestOptions } = {}
  }) => {
    const {
      current = 1,
      pageSize = 10,
      mode = "server",
    } = pagination ?? {};

    // const { method, queryContext, searchParams, q, ...requestOptions } = meta ?? {};

    try {
      const paginationOff = mode === "off"; // mode === "server"

      let query: any = { ...setAppLang(), ...searchParams };

      if(!paginationOff){
        if(q){
          query.q = q;
        }

        query.page = current;
        query.perPage = pageSize;

        // decodeURIComponent()

        parseFilters(filters, query);
        parseSorts(sorters, query);
      }

      const response: any = await httpClient(resource, {
        method: (method as MethodCommons) ?? "get",
        signal: queryContext?.signal, // For abort request
        ...requestOptions,
        searchParams: query,
      }).json();
      
      // console.log('getList response: ', response);

      const data = response?.data;

      if(response?.errors){
        throw new CustomError('ReadError', response?.message || i18n.t('error.unspecific'), response);
      }

      if(paginationOff){
        return data;
      }

      const { total, ...otherData } = response;

      return {
        ...otherData,
        data,
        total: total || data.length || 0,
      };
    } catch(e){
      throw e;
    }
  },

  getMany: async ({ 
    resource, 
    ids, 
    meta: { method, queryContext, searchParams, ...requestOptions } = {}
  }) => {
    // const { method, queryContext, searchParams, ...requestOptions } = meta ?? {};

    try {
      const response: any = await httpClient(
        resource, // apiUrl + '/' + resource,
        { 
          ...requestOptions,
          method: (method as MethodTypes) ?? "get",
          signal: queryContext?.signal, 
          searchParams: { ...setAppLang(), ...searchParams, id: ids }, 
        }
      )
      .json();
      
      if(response?.errors){
        throw new CustomError('ReadError', response?.message || i18n.t('error.unspecific'), response);
      }
      return response;
    } catch(e){
      throw e;
    }
  },

  // { resource, variables, meta } | body, json
  create: async ({ 
    resource, 
    variables, 
    meta: { method, body, searchParams, ...requestOptions } = {}
  }) => {
    // const { method, body, ...requestOptions } = meta ?? {}; // , queryContext
    const requestMethod = (method as MethodCommons) ?? "post"; // MethodTypesWithBody | MethodCommons

    try {
      const response: any = await httpClient(
        resource,
        {
          ...requestOptions,
          method: requestMethod,
          body,
          json: requestMethod === 'get' || body ? undefined : variables,
          searchParams: { ...setAppLang(), ...searchParams },
        }
      ).json();

      // console.log('req: ', req)

      // console.log('queryContext: ', queryContext)
      /** @DEV : signal not work if method get */
      // const { data } = await httpClient({
      //   ...requestOptions,
      //   method: requestMethod,
      //   url: apiUrl + '/' + resource,
      //   data: variables,
      //   signal: requestMethod === 'get' ? queryContext?.signal : requestOptions.signal,
      // });

      if(response?.errors){
        throw new CustomError('CreateError', response?.message || i18n.t('error.unspecific'), response);
      }
      return response;
    } catch(e) {
      throw e;
    }
  },

  update: async ({ 
    resource, 
    id, 
    variables, 
    meta: { method, searchParams } = {}
  }) => {
    // const { method } = meta ?? {}; // , queryContext, ...requestOptions

    try {
      const response: any = await httpClient(
        resource + (id ? '/' + id : ''), // `${apiUrl}/${resource}${id ? '/' + id : ''}`,
        {
          method: (method as MethodTypesWithBody) ?? "put",
          json: variables,
          searchParams: { ...setAppLang(), ...searchParams },
        }
        /** @DEV : must check & test (use or not) */
        // { signal: queryContext?.signal, ...requestOptions }
        // { ...queryContext, ...requestOptions }
      ).json();

      if(response?.errors){
        throw new CustomError('UpdateError', response?.message || i18n.t('error.unspecific'), response);
      }
      return response;
    } catch(e) {
      throw e;
    }
  },

  getOne: async ({ 
    resource, 
    id, 
    meta: { method, queryContext, searchParams, ...requestOptions } = {}
  }) => {
    // const { method, queryContext, ...requestOptions } = meta ?? {};

    try {
      const response: any = await httpClient(
        resource + (id ? '/' + id : ''),
        { 
          ...requestOptions,
          method: (method as MethodTypes) ?? "get",
          searchParams: { ...setAppLang(), ...searchParams },
          signal: queryContext?.signal,
        }
      ).json();

      if(response?.errors){
        throw new CustomError('ReadError', response?.message || i18n.t('error.unspecific'), response);
      }
      return response;
    } catch(e) {
      throw e;
    }
  },
  
  deleteOne: async ({ 
    resource, 
    id, 
    variables, 
    meta: { method, searchParams } = {}
  }) => {
    // const { method } = meta ?? {}; // , queryContext

    try {
      const response: any = await httpClient(
        resource + "/" + id,
        {
          method: (method as MethodTypesWithBody) ?? "delete",
          json: variables,
          searchParams: { ...setAppLang(), ...searchParams },
        },
        /** @DEV : must check & test (use or not) */
        // { signal: queryContext?.signal }
      ).json();

      if(response?.errors){
        throw new CustomError('DeleteError', response?.message || i18n.t('error.unspecific'), response);
      }
      return response;
    } catch(e){
      throw e;
    }
  },

  deleteMany: async ({ 
    resource, 
    ids, 
    meta: { method, searchParams } = {}
    // variables
  }) => {
    // const { method } = meta ?? {}; // , queryContext

    try {
      const response: any = await httpClient(
        resource, 
        { 
          method: (method as MethodTypesWithBody) ?? "delete",
          json: ids,
          searchParams: { ...setAppLang(), ...searchParams },
        }, // , variables

        /** @DEV : must check & test (use or not) */
        // { signal: queryContext?.signal }
      ).json();

      if(response?.errors){
        throw new CustomError('DeleteManyError', response?.message || i18n.t('error.unspecific'), response);
      }
      return response;
    } catch(e) {
      throw e;
    }
  },

  getApiUrl: () => apiUrl,

  custom: async ({
    url,
    method,
    filters,
    sorters,
    // payload, 
    // query,
    // headers,
    meta: { 
      queryContext, 
      signal: abortSignal, 
      searchParams, 
      headers, 
      q, 
      pagination, 
      ...requestOptions
    } = {},
  }) => {
    const {
      current = 1,
      pageSize = 10,
      mode = "server",
    } = pagination ?? {};

    try {
      const paginationOff = mode === "off"; // mode === "server"

      let query: any = { ...setAppLang(), ...searchParams };

      if(!paginationOff){
        if(q){
          query.q = q;
        }

        query.page = current;
        query.perPage = pageSize;

        parseFilters(filters, query);
        parseSorts(sorters, query);
      }

      const response: any = await httpClient(url, {
        method: (method as MethodCommons) ?? "get",
        signal: queryContext?.signal, // For abort request
        ...requestOptions,
        searchParams: query,
      }).json();
      
      // console.log('getList response: ', response);

      const data = response?.data;

      if(response?.errors){
        throw new CustomError('ReadError', response?.message || i18n.t('error.unspecific'), response);
      }

      if(paginationOff){
        return data;
      }

      const { total, ...otherData } = response;

      return {
        ...otherData,
        data,
        total: total || data.length || 0,
      };
    } catch(e){
      throw e;
    }
  },
});
