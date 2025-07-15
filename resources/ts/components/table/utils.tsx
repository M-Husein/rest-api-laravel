import { useRef } from 'react'; // , useState
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import type { InputRef, TableColumnType } from 'antd'; // , TableColumnsType
import { Input, Button } from 'antd'; // , Space, 
// import type { FilterDropdownProps } from 'antd/es/table/interface';

// export const getFilterItem = (filters: any, field: string) => {
//   return filters?.find((item: any) => item.field === field)?.value?.[0] || "";
// }

// export const setOrders = (sorters: Array<any>) => {
//   return sorters?.map((item: any) => ({ columnName: item.field, direction: item.order }) );
// }

type DataIndex = string; //  | number

export const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<any> => { // , filters?: any
  const searchInput = useRef<InputRef>(null);

  return {
    filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters, close }) => {
      // console.log('selectedKeys: ', selectedKeys)
      // console.log('etc: ', etc)
      const changeInput = (e: any) => {
        let val = e.target.value;
        setSelectedKeys(val ? [val] : []);
      }

      const doSearch = (val: string, e: any, { source }: any) => {
        e.stopPropagation();
        if(e.type === "click" && e.target.tagName !== "INPUT"){
          setTimeout(() => {
            searchInput.current?.focus?.({ preventScroll: true });
          }, 1);
        }

        if(source === 'clear' && clearFilters){
          clearFilters()
        }

        confirm({ closeDropdown: !!val?.length });
      }

      return (
        <div 
          className="p-2 border border-sky-500 rounded-md flex"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Input.Search
            ref={searchInput}
            allowClear
            // size="small"
            placeholder="Search"
            value={selectedKeys[0]} // || filters?.find((item: any) => item.field === dataIndex)?.value?.[0]
            onChange={changeInput}
            // onPressEnter={() => confirm()} // handleSearch(selectedKeys as string[], confirm, dataIndex)
            onSearch={doSearch} // () => confirm()
          />
          
          <Button
            title="CLose"
            className="ml-1"
            icon={<CloseOutlined />}
            onClick={() => close()}
          />
        </div>
      )
    },
    filterIcon: () => ( // filtered: boolean
      // style={filtered ? { color: '#1677ff', background: '#bae0ff' } : {}}
      <SearchOutlined title="Filter" />
    ),
    onFilter: (value, record) => {
      return record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase())
    },
    // onFilterDropdownOpenChange: (visible: any) => {
    //   if (visible) {
    //     setTimeout(() => searchInput.current?.select(), 9);
    //   }
    // },
    filterDropdownProps: {
      onOpenChange: (visible: any) => {
        if (visible) {
          setTimeout(() => searchInput.current?.focus({ preventScroll: true }), 9);
        }
      },
    }
  }
}
