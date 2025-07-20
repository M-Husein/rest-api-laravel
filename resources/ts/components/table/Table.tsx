import type { TableProps } from 'antd';
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
  // dataSource,
  pagination,
  // scroll,
  ...etc
}: TableProps) => {
  return (
    <AntTable
      size="small"
      rowKey="id"
      bordered
      // virtual={!!scroll?.x && !!scroll?.y && dataSource?.length > 500} // 1e3

      {...etc}

      // dataSource={dataSource}
      // scroll={scroll}

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
