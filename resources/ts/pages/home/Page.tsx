// import { useState } from "react";
import { useDocumentTitle } from "@refinedev/react-router-v6";
// import { HttpError, useOne, useNotification, useUpdate } from "@refinedev/core";
import { Card } from 'antd';

export default function Page(){
  useDocumentTitle("Home - " + import.meta.env.VITE_APP_NAME);

  return (
    <Card 
      title="Home"
      className="shadow"
    >
      
    </Card>
  );
}
