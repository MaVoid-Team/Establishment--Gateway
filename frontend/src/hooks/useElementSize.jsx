import { useState, useEffect, useRef } from 'react';

export default function useElementSize() {
  const ref = useRef();
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(ref.current);

    // Cleanup on unmount
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return [ref, size];
}