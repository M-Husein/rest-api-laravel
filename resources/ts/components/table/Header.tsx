import { useRef } from 'react';
import { Input } from 'antd';

type IProps = {
  title?: any;
  content?: any;
  placeholder?: string;
  onSearch?: (val: string, e: any, src: any) => void;
}

export const Header = ({
  title,
  content,
  placeholder = "Search",
  onSearch,
}: IProps) => {
  const searchInput = useRef<any>();

  const doSearch = (val: string, e: any, src: any) => {
    e.stopPropagation();
    if(e.type === "click" && e.target.tagName !== "INPUT"){
      setTimeout(() => {
        searchInput.current?.focus?.({ preventScroll: true });
      }, 1);
    }

    onSearch?.(val, e, src);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {title && <div className="font-medium text-lg mb-0 mr-auto">{title}</div>}

      {content}

      {onSearch && (
        <Input.Search
          ref={searchInput}
          allowClear
          className="w-56"
          placeholder={placeholder}
          onSearch={doSearch}
        />
      )}
    </div>
  );
}
