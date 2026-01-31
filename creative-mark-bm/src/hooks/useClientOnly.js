import { useState, useEffect } from 'react';

/**
 * Hook to ensure components only render on the client side
 * This prevents hydration mismatches for components that use
 * dynamic values like Date.now(), Math.random(), etc.
 */
export const useClientOnly = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

/**
 * Hook to safely get current date/time on client side only
 */
export const useClientDate = () => {
  const [currentDate, setCurrentDate] = useState(null);
  const isClient = useClientOnly();

  useEffect(() => {
    if (isClient) {
      setCurrentDate(new Date());
    }
  }, [isClient]);

  return currentDate;
};

/**
 * Hook to safely generate random values on client side only
 */
export const useClientRandom = (min = 0, max = 1) => {
  const [randomValue, setRandomValue] = useState(null);
  const isClient = useClientOnly();

  useEffect(() => {
    if (isClient) {
      setRandomValue(Math.random() * (max - min) + min);
    }
  }, [isClient, min, max]);

  return randomValue;
};
