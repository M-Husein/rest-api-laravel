import { useState } from "react";
import { useCreate } from "@refinedev/core"; // HttpError, useOne, useNotification, useUpdate
import { Button, Checkbox, Modal } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import type { CheckboxProps } from 'antd';

const label = "Clear Cache";
const clearOptions = [
  'cache',
  'config',
  'route',
  'view',
  'event',
  'compiled',
];

export const ClearCache = () => {
  const [modalApi, modalContext] = Modal.useModal();
  const { mutate: mutateCreate, isPending } = useCreate(); // overtime, isLoading
  const [open, setOpen] = useState<boolean>(false);
  const [checkedList, setCheckedList] = useState<string[]>([]);

  const checkAll = clearOptions.length === checkedList.length;
  const indeterminate = checkedList.length > 0 && checkedList.length < clearOptions.length;

  const toggleOpen = () => setOpen(!open);

  const closeAndUnchecked = () => {
    toggleOpen();
    if(checkedList.length) setCheckedList([]);
  }

  // console.log('overtime: ', overtime); // overtime.elapsedTime

  const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
    setCheckedList(e.target.checked ? clearOptions : []);
  }

  const clearCache = () => {
    /** @DEV_OPTION : Check again user is admin or not */
    modalApi.confirm({
      centered: true,
      keyboard: false,
      maskClosable: false,
      title: "Are you sure to clear cache App?",
      onOk: () => {
        mutateCreate({
          resource: "clear-cache",
          values: { types: checkedList },
        }, {
          onSuccess: closeAndUnchecked
        });
      },
    });
  }

  return (
    <>
      <Button 
        danger
        type="primary"
        icon={<ClearOutlined />}
        onClick={toggleOpen}
      >
        {label}
      </Button>
      
      <Modal
        centered
        title={label}
        open={open}
        keyboard={false}
        maskClosable={false}
        closable={false}
        okButtonProps={{
          danger: true,
          type: "primary",
          disabled: !checkedList.length,
          loading: isPending
        }}
        cancelButtonProps={{
          disabled: isPending
        }}
        onOk={clearCache}
        onCancel={closeAndUnchecked}
      >
        <Checkbox 
          className="mt-4"
          disabled={isPending}
          indeterminate={indeterminate} 
          onChange={onCheckAllChange} 
          checked={checkAll}
        >
          All
        </Checkbox>
        <hr className="my-2" />
        <Checkbox.Group 
          className="inline-flex flex-col gap-y-1 capitalize"
          disabled={isPending}
          options={clearOptions} 
          value={checkedList} 
          onChange={setCheckedList} 
        />
      </Modal>

      {modalContext}
    </>
  );
}
