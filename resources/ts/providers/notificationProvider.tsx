import { NotificationProvider } from "@refinedev/core";
import { App, notification as staticNotification } from "antd";

export const useNotificationProvider = (): NotificationProvider => {
  const { notification: notificationFromContext } = App.useApp();
  const notification = "open" in notificationFromContext ? notificationFromContext : staticNotification;

  return {
    open: ({
      key,
      message,
      description,
      type,
      // CUSTOM
      placement = "bottomLeft",
      duration = 4.5,
      showProgress,
      ...etc
    }: any) => {
      // Don't show notification if request abort / cancel
      if(description === 'AbortError'){ //  || description === 'canceled'
        return;
      }

      let isProgress = type === "progress";

      notification.open({
        key,
        // description: message,
        /** @DEV : Find other solution */
        description: typeof message === 'string' ? message.split('&#x2F;')[0].replaceAll('-', ' ') : message,
        message: description ?? null,
        // type,
        type: isProgress ? undefined : type,
        /** @CUSTOM */
        placement,
        duration,
        showProgress: isProgress ? !0 : showProgress,
        ...etc
      });
    },
    close: (key: any) => notification.destroy(key),
  };
}
