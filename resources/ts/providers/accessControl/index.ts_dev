import { IResourceItem, BaseKey } from "@refinedev/core";

type CanParams = {
  resource: string;
  action: string;
  params?: {
    resource?: IResourceItem;
    id?: BaseKey;
    [key: string]: any;
  };
};

type CanReturnType = {
  can: boolean;
  reason?: string;
};

export interface IAccessControlContext {
  can?: ({ resource, action, params }: CanParams) => Promise<CanReturnType>;
  options?: {
    buttons?: {
      // default is true
      enableAccessControl?: boolean;
      // default is false
      hideIfUnauthorized?: boolean;
    };
  };
}

export const accessControlProvider: IAccessControlContext = {
  // @ts-ignore
  can: async ({ resource, action, params }) => {
    if (resource === "upload-logs" && action === "list") {
      return {
        can: false,
        reason: "Unauthorized",
      };
    }

    return { can: true };
  },
  // Global settings
  options: {
    buttons: {
      enableAccessControl: true,
      // hide action buttons if not authorized.
      hideIfUnauthorized: true,
    },
  },
}
