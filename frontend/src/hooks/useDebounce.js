/**
 * Responsibilities:
 *  - Debounce a value by delaying updates until after delay ms of inactivity
 *  - Used for search inputs, filter changes that trigger API calls
 */

import { useState, useEffect } from 'react';

const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
