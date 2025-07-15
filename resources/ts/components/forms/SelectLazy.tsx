import { forwardRef, useCallback, useState, useMemo } from 'react';
import { Select, Skeleton } from 'antd';
import debounce from 'lodash/debounce';
// import cx from 'classnames';

export const SelectLazy = forwardRef(
  (
    {
      more,
      loading,
      popupClassName,
      notFoundContent,
      options,
      onPopupScroll,
      onPopupScrollEnd,
      onSearch,
      showSearch = !0,
      optionFilterProp = "text",
      fieldNames = { label: "text", value: "id" },
      placeholder = "Please Select",
      onChange,
      ...etc
    }: any,
    ref
  ) => {
    const debouncedScroll = useCallback(debounce((e: any) => {
      const { scrollTop, offsetHeight, scrollHeight } = e.target;
      onPopupScrollEnd(scrollTop + offsetHeight === scrollHeight, e);
    }, 95), []);

    const popupScroll = (e: any) => {
      onPopupScroll?.(e);

      if(typeof onPopupScrollEnd === 'function' && more && !loading){
        debouncedScroll(e);
      }
    }

    const doSearch = useCallback(debounce((val: any) => {
      onSearch?.(val);
    }, 500), []);

    const [selected, setSelected] = useState<any>();

    const doChange = (val: any, option: any) => {
      // For handle selected option not available in current page
      setSelected(option);

      onChange?.(val, option);
    }

    const parseOptions = useMemo(() => {
      // For handle selected option not available in current page
      if(onPopupScrollEnd && selected && options?.length > 8 && !options.find((item: any) => item.id === selected.id)){
        return [
          selected,
          ...options
        ].filter((item, index, arr) => 
          index === arr.findIndex((t) => t[fieldNames.value] === item[fieldNames.value])
        );
      }
      return options;
    }, [options, selected, onPopupScrollEnd]);

    const loader = (cls = "") => <Skeleton active title={false} paragraph={{ rows: 1, width: '100%' }} className={"py-1 " + cls} />;
  
    return (
      <Select
        {...etc}
        ref={ref}
        fieldNames={fieldNames}
        optionFilterProp={optionFilterProp}
        virtual={!loading}
        showSearch={showSearch}
        loading={loading}
        options={parseOptions} // options
        placeholder={loading ? "Loading" : placeholder}
        notFoundContent={loading ? loader() : notFoundContent}
        // popupClassName={
        //   cx(loading && options?.length > 8 && "antSelectLoading", popupClassName)
        // }
        // Only add custom class for styling scroll area
        popupClassName={(loading && options?.length > 8 ? "antSelectLoading " : "") + popupClassName}
        dropdownRender={(menu) => (
          <>
            {menu}
            {loading && loader("px-3")}
          </>
        )}
        onChange={doChange}
        onPopupScroll={popupScroll}
        onSearch={showSearch ? doSearch : undefined}
      />
    );
  }
);
