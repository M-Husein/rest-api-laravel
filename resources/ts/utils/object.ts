export const obj2FormData = (obj: any) => {
  let fd = new FormData();
  for(let key in obj){
    fd.append(key, obj[key]);
  }
  return fd;
}
