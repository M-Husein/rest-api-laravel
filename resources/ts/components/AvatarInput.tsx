import { useState } from 'react';
import type { UploadFile, UploadProps, RcFile } from 'antd/es/upload/interface';
import { Button, Avatar, Upload, Modal } from 'antd'; // Card, Col, Row, 
import { UserOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import ImgCrop from 'antd-img-crop';
import { useOne, useUpdate, useDelete } from "@refinedev/core";

const getBase64 = (file: RcFile): Promise<string> => new Promise((resolve, reject) => {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = reject;
});

export function AvatarInput({
  id,
  disabled,
  loading,
  value,
}: any){
  const { mutate: mutateUpdate, isLoading: isLoadingUpdate } = useUpdate();
  const { mutate: mutateDelete, isLoading: isLoadingDelete } = useDelete();
  const [modalApi, modalContextHolder] = Modal.useModal();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState('');

  const {
    // data,
    isLoading,
    isFetching,
    isRefetching,
  } = useOne({
    resource: "application-user/image", // /api/application-user/image/{Id}
    id,
    successNotification: (res: any) => {
      let base64 = res?.data?.image_base64;
      if(base64){
        setPreviewImage(`data:${res.data.image_mime_type};base64,${base64}`);
      }
      return false
    }
  });
  // console.log('data: ', data)

  let loadingData = (isLoading || isFetching || isRefetching) && !!id;
  let avatarSrc = previewImage || value; //  || data?.data?.image_base64

  const onChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const removeFile = () => {
    const confirmModal = modalApi.confirm({
      keyboard: false,
      centered: true,
      closable: true,
      okButtonProps: { danger: true },
      title: "Are you sure to delete profile picture?",
      onOk: () => new Promise((resolve, reject) => {
        const updateModal = (closable: boolean) => {
          confirmModal.update({ closable })
        }
        updateModal(false)

        mutateDelete({
          resource: "application-user/image/clear", // /api/application-user/image/clear/{Id}
          id,
        }, {
          onSuccess: (res) => {
            setPreviewImage('');
            setFileList([]);
            resolve(res)
          },
          onError: (e) => {
            updateModal(true)
            reject(e)
          },
        });
      }),
    });
  }

  const customRequest = (file: any) => { // { file }: any | onSuccess, onError, 
    getBase64(file)
      .then((res) => {
        mutateUpdate({
          resource: "application-user/image", // /api/application-user/image/update
          id: "update",
          values: {
            id,
            image_base64: res, // splits[1].replace('base64,', ''),
            image_mimetype: file.type
          },
          successNotification: () => ({
            type: "success",
            message: "Upload successfuly"
          })
        }, {
          onSuccess: () => { // resData
            // console.log('onSuccess resData: ', resData)
            setPreviewImage(res);
          },
          // onError: (e) => {
          //   console.log('onError e: ', e)
          // }
        });
      })
      .catch(console.log);

    return false;
  }

  const onPreview = () => {
    if(avatarSrc) setPreviewOpen(true);
  }

  let loadingOrDisabled = disabled || isLoadingUpdate || isLoadingDelete || loadingData;

  return (
    <div className="inline-block text-center px-4">
      <button
        type="button"
        onClick={onPreview}
        tabIndex={avatarSrc ? undefined : -1}
        disabled={loadingOrDisabled}
        className={"relative inline-block bg-main p-2 rounded-full border shadow"+ (avatarSrc ? " hover_ring cursor-pointer" : "")}
      >
        {(loadingData || loading) && (
          <i 
            role="status"
            className="spinner-border absolute inset-0" 
            style={{
              width: 145,
              height: 145,
            }}
          />
        )}

        <Avatar
          size={127}
          icon={<UserOutlined />}
          src={avatarSrc || null}
          alt="Avatar"
        />
      </button>

      <div className="mt-2">
        {avatarSrc && ( // previewImage
          <Button
            title="Delete"
            danger
            // size="small"
            icon={<DeleteOutlined />} 
            disabled={loadingOrDisabled}
            loading={isLoadingDelete}
            onClick={removeFile}
          />
        )}
        {' '}
        <ImgCrop
          rotationSlider
          // modalOk={translate('buttons.save')}
          // modalCancel={translate('buttons.cancel')}
          modalProps={{
            okButtonProps: { loading: isLoadingUpdate },
            cancelButtonProps: { disabled: isLoadingUpdate },
          }}
          // onModalOk={customRequest}
          // onModalOk={(e) => console.log('onModalOk e: ', e)}
        >
          <Upload
            // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            accept="image/png,image/jpeg"
            // listType="picture-circle"
            maxCount={1}
            showUploadList={false}
            fileList={fileList}
            disabled={loadingOrDisabled} // isLoadingUpdate || loadingData
            // customRequest={customRequest}
            beforeUpload={customRequest} // () => false
            onChange={onChange}
            // onPreview={doPreview}
            className="antUpload inline-block"
          >
            <Button 
              // tabIndex={-1} 
              // size="small"
              type="primary"
              icon={<UploadOutlined />} 
              title="Select file" 
            />
          </Upload>
        </ImgCrop>
      </div>

      <Modal
        open={previewOpen}
        title="Avatar"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img
          alt="preview"
          src={avatarSrc}
          className="w-full rounded-full mt-2"
        />
      </Modal>

      {modalContextHolder}
    </div>
  );
}
