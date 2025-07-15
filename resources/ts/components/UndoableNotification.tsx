// import React from "react";
import { OpenNotificationParams } from "@refinedev/core";
import { Button, Progress } from "antd";
import { UndoOutlined } from "@ant-design/icons";

export type UndoableNotificationProps = {
  notificationKey: OpenNotificationParams["key"];
  message: OpenNotificationParams["message"];
  cancelMutation: OpenNotificationParams["cancelMutation"];
  undoableTimeout: OpenNotificationParams["undoableTimeout"];
};

export const UndoableNotification: React.FC<UndoableNotificationProps> = ({
  message,
  cancelMutation,
  undoableTimeout,
}) => (
  <div className="flex items-center justify-between -mt-2">
    <Progress
      type="circle"
      percent={(undoableTimeout ?? 0) * 20}
      format={(time) => time && time / 20}
      size={50} // width
      strokeColor="#1890ff"
      status="normal"
    />

    {/* <span style={{ marginLeft: 8, width: "100%" }}>{message}</span> */}
    <div className="w-full ml-2">{message}</div>

    <Button
      className="flex-shrink-0"
      onClick={cancelMutation}
      disabled={undoableTimeout === 0}
      icon={<UndoOutlined />}
    />
  </div>
);
