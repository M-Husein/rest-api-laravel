// https://github.com/primefaces/primereact/blob/master/src/components/utils/UniqueComponentId.js
let lastId = 0;

export function incrementId(prefix: any = 'q_'){
  lastId++;
  return prefix + lastId;
}
