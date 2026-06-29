/**
 * hooks/useLocalStorage.js — LocalStorage Hook
 *
 * Responsibilities:
 *  - Read/write values to localStorage with JSON serialization
 *  - Returns [storedValue, setValue, removeValue]
 *
 * @param {string} key
 * @param {any} initialValue
 */

import { useState } from 'react';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    // TODO: Try JSON.parse(localStorage.getItem(key)) || initialValue
    return initialValue;
  });

  const setValue = (value) => {
    // TODO: localStorage.setItem(key, JSON.stringify(value))
    setStoredValue(value);
  };

  const removeValue = () => {
    localStorage.removeItem(key);
    setStoredValue(initialValue);
  };

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
