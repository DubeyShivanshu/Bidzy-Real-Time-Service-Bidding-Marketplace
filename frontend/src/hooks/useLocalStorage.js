/**
 * Responsibilities:
 *  - Read/write values to localStorage with JSON serialization
 *  - Returns [storedValue, setValue, removeValue]
 */

import { useState } from 'react';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    // Try JSON.parse(localStorage.getItem(key)) || initialValue
    return initialValue;
  });

  const setValue = (value) => {
    // localStorage.setItem(key, JSON.stringify(value))
    setStoredValue(value);
  };

  const removeValue = () => {
    localStorage.removeItem(key);
    setStoredValue(initialValue);
  };

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
