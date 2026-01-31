"use client";

import { useClientOnly } from '../hooks/useClientOnly';

/**
 * Component that only renders its children on the client side
 * This prevents hydration mismatches for components that use
 * dynamic values like Date.now(), Math.random(), etc.
 */
export const ClientOnly = ({ children, fallback = null }) => {
  const isClient = useClientOnly();

  if (!isClient) {
    return fallback;
  }

  return children;
};

export default ClientOnly;
