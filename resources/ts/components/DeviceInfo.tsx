import { useState } from "react"; // , useEffect
import { Tooltip, Button, Dropdown, Space, Input } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { FaEllipsisV } from "react-icons/fa";

const copyTooltip = "Copy to clipboard";
const uid = localStorage.getItem('deviceID') as any;

export function DeviceInfo(){
  const [tip, setTip] = useState<string>(copyTooltip);

  const resetTip = (txt: string) => {
    setTip(txt);
    setTimeout(() => {
      setTip(copyTooltip)
    }, 1500);
  }

  const copyText = async (text: string) => {
    if(tip !== copyTooltip){
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      resetTip("Copied...!!!");
    } catch (err) {
      // console.error('Failed to copy: ', err);
      resetTip("Failed to copy");
    }
  }

  return (
    <Dropdown 
      placement="bottomRight"
      trigger={['click']}
      menu={{
        items: [
          {
            key: "1",
            disabled: true,
            label: (
              <div className="-my-2 -mx-3 p-2 cursor-auto">
                <div className="text-gray-600 mb-1 font-bold">Device ID</div>
                <Space.Compact>
                  <Input
                    style={{ width: 285 }}
                    readOnly
                    value={uid}
                  />
                  <Tooltip title={tip} placement="bottom">
                    <Button 
                      icon={<CopyOutlined />}
                      onClick={() => copyText(uid)}
                    />
                  </Tooltip>
                </Space.Compact>
              </div>
            )
          }
        ]
      }}
    >
      <Button
        // size="small"
        icon={<FaEllipsisV className="align--1px" />} 
        // className="absolute top-3 left-3 z-1"
      />
    </Dropdown>
  );
}
