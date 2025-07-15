// import type { TableProps } from 'antd';
// import { useRef } from 'react';
import { Table as AntTable } from 'antd'; // , Input

/**
 * @props pagination Object
 * @props ...etc antd Table props
 * @returns antd Table component
 * 
 * @DOCS : https://ant.design/components/table
 */
export const Table = ({
  pagination,
  ...etc
}: any) => {
  return (
    <AntTable
      size="small"
      rowKey="id"
      bordered

      {...etc}

      pagination={
        pagination ? {
          showSizeChanger: true,
          showTotal: (total, [range1, range2]) => `${range1}-${range2} of ${total} items`,
          ...pagination,
          // position: ["bottomCenter"], // default = bottomRight
        }
        : 
        false
      }
    />
  )
}
