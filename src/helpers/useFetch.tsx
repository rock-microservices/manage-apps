import { useState, useEffect } from "react";

export const useFetch = <T,>(url: RequestInfo, opts?: RequestInit): [T | null, boolean, boolean] => {
  const [response, setResponse] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetch(url, opts)
      .then(async (res) => {
        const data: T = await res.json();
        setResponse(data);
        setLoading(false);
      })
      .catch(() => {
        setHasError(true);
        setLoading(false);
      });
  }, [url]);
  return [response, loading, hasError];
};
