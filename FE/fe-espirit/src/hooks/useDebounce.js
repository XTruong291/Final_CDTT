import { useEffect, useState } from 'react';

// Dùng cho các ô tìm kiếm (tra cứu nghi thức, tìm sản phẩm...) để giảm số lần gọi API.
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
