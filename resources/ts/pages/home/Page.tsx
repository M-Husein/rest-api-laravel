// import { useState } from "react";
import { useDocumentTitle } from "@refinedev/react-router-v6";
// import { HttpError, useOne, useNotification, useUpdate } from "@refinedev/core";
import { Card } from 'antd';

export default function Page(){
  useDocumentTitle("Home - " + import.meta.env.VITE_APP_NAME);

  return (
    <Card 
      title="Home"
      className="shadow" // flex flex-col  h-full
      // classNames={{ 
      //   title: "text-center text-2xl text-sky-900 font-bold",
      //   body: "!p-0 h-full grow" 
      // }}
    >
      
    </Card>
  );
}
