/**
 * @param {*} arr Array []
 * @param {*} fn Function search conditional
 * @param {*} keyChild object key to children
 * @returns 
 */
export function recursiveFilter(
  arr: Array<any>,
  fn: Function,
  keyChild: string = "children"
): Array<any> {
  return arr.reduce((accumulator, currentValue) => {
    let children = recursiveFilter(currentValue[keyChild] || [], fn, keyChild);
    let childLength = children.length;

    if(fn(currentValue) || childLength){
      // accumulator.push(
      //   Object.assign({}, currentValue, childLength && { [keyChild]: children })
      // );

      accumulator = [
        ...accumulator,
        Object.assign({}, currentValue, childLength && { [keyChild]: children })
      ];
    }

    return accumulator;
  }, []);
}

/**
 * @param {*} arr Array []
 * @param {*} fn Function search conditional
 * @param {*} keyChild object key to children
 * @returns Object search result
 */
// export function recursiveFind(
//   arr: Array<any>,
//   fn: Function,
//   keyChild: string = "children"
// ): Array<any> | null {
//   for(let obj of arr){
//     if(fn(obj)){
//       return obj;
//     }
//     if(Array.isArray(obj[keyChild])){
//       let result: any = recursiveFind(obj[keyChild], fn, keyChild);
//       if (result) {
//         return result;
//       }
//     }
//   }
//   return null;
// }

const filterFn = (val: any, parentId?: any) => val.parent_business_unit_id === parentId;

const sortArr = (a: any, b: any) => a.order_index - b.order_index;

/**
 * @param {*} arr Array
 * @param parentId string | null
 * @returns Array tree
 */
export function parseTree(arr: Array<any>, parentId = null){
  let tree: Array<any> = [];
  let item: any;

  const filterArr = arr.filter((val: any) => filterFn(val, parentId));

  for (item of filterArr) {
    let children = parseTree(arr, item.id);
    let childLength = children.length;

    if (childLength) {
      // item.children = children;
      item.children = childLength > 1 ? children.toSorted(sortArr) : children;
    }

    /** @NOTE : Check perfomance */
    // tree.push(item);
    // OR
    // tree.concat(item);
    tree = [...tree, item];
  }
  
  return tree;
}
