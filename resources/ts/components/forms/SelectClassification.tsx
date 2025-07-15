import { useMemo } from 'react';
import { SelectLazy } from '@/components/forms/SelectLazy';

const filterFn = (val: any, parentId?: any) => val.parent_category_id === parentId;

// const sortArr = (a: any, b: any) => {
//   if (a.id < b.id) return 1; 
//   if (a.id > b.id) return -1; 
//   return 0;
// }

function parseTree(arr: Array<any>, parentId = null){
  let tree: Array<any> = [];
  let item: any;

  let filterArr = arr.filter((val: any) => filterFn(val, parentId));

  for(item of filterArr){
    let children = parseTree(arr, item.id);
    // let childLength = children.length;

    if(children.length){ // childLength
      // if(childLength > 1){
      //   children.sort(sortArr);
      // }
      item.options = children; // children
    }

    tree.push(item); // tree = [...tree, item];
  }
  
  return tree;
}

export function SelectClassification({
  myRef,
  options,
  ...etc
}: any){
  const parseOptions = useMemo(() => {
    return options && parseTree(options); // []
  }, [options]);

  // console.log('parseOptions: ', parseOptions);

  return (
    <SelectLazy
      {...etc}
      ref={myRef}
      fieldNames={{ label: "category_name", value: "id" }}
      optionFilterProp="category_name" // @ts-ignore
      options={parseOptions}
      // optionRender={(option: any) => (
      //   <div>
      //     <span role="img" aria-label={option.data.label}>
      //       {option.data.emoji}
      //     </span>
      //     {option.data.desc}
      //   </div>
      // )}
    />
  );
}

