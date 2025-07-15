// import { useState } from "react";
import { useDocumentTitle } from "@refinedev/react-router-v6";
import { HttpError, useParsed, useOne, useNavigation } from "@refinedev/core"; // , useNotification, useUpdate
import { Card, Button } from 'antd';

const title = "Email Verification";

// get 'email/verify/{id}/{hash}'
// post 'email/verification-notification'

export default function Page(){
  useDocumentTitle(title + " - " + import.meta.env.VITE_APP_NAME);

  // params: { current, pageSize, sorters, filters }
  const { id, pathname } = useParsed<any>();
  const { replace } = useNavigation();

  const {
    data,
    isLoading,
  } = useOne<any, HttpError>({
    queryOptions: {
      enabled: !!id
    },
    resource: pathname?.replace('/',''), // "email/verify"
    id: "",
    successNotification: (res: any) => {
      if(res.data){ //  === 1
        replace('/');
      }
      return {
        type: "success",
        message: "Verified",
        description: res.message,
      }
    }
  });

  // console.log('pathname: ', pathname);
  // console.log('data: ', data);

  return (
    <div className="grid place-content-center min-h-screen">
      <Card 
        title={title}
        className="shadow"
      >
        {/* @ts-ignore */}
        <h1 className="text-lg">{isLoading ? "Loading" : data?.message}</h1>

        {!!data?.data && (
          <Button
            type="primary"
            onClick={() => replace('/')}
          >
            Back to Home
          </Button>
        )}
      </Card>
    </div>
  );
}
