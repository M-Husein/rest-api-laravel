import { useRef, useState, useMemo, useDeferredValue } from 'react';

// export interface useSelect2Options {
//   firstOpen: boolean;
//   page: number | string;
//   q?: string;
// }

export const useSelect2 = ({
  firstOpen = false,
  page = 1,
  q = '',
} = {} as any) => { // as  as useSelect2Options
  const [openFirst, setFirstOpen] = useState<boolean>(firstOpen);
  const [currentPage, setPage] = useState<number>(page); //  | string
  const [searchSelect, setSearch] = useState<string>(q);

  const deferredQuery = useDeferredValue(searchSelect);

  return {
    firstOpen: openFirst,
    page: currentPage,
    q: deferredQuery, // searchSelect,
    setFirstOpen,
    setPage,
    setSearch,
  }
}

export const useSelect2Data = (data?: any, q?: any) => {
  const morePageRef: any = useRef(true);
  const scrollPages: any = useRef([]);
  const searchResult: any = useRef([]);

  const options = useMemo(() => {
    if(data){
      let results = data.results || [];

      if(q){
        morePageRef.current = true;
        // scrollPages.current = [];
        searchResult.current = results;
      }
      else{
        morePageRef.current = !!data.pagination?.more;
        scrollPages.current = [ ...scrollPages.current, ...results ].filter((value, index, arr) => 
          index === arr.findIndex((t) => t.id === value.id)
        );
      }

      // scrollPages.current = searchSelect ? 
      //   results
      //   :
      //   [ ...scrollPages.current, ...results ].filter((value, index, arr) => {
      //     return index === arr.findIndex((t) => t.id === value.id);
      //   });

      // // morePageRef.current = !!datas.pagination?.more;
      // morePageRef.current = searchSelect ? 1 : !!datas.pagination?.more; // datas.count
    }

    return scrollPages.current;
     // @ts-ignore
  }, [data]);

  return {
    more: morePageRef.current,
    searchResult: searchResult.current,
    options,
  }
}
