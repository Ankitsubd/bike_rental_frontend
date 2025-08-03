import { useEffect, useState } from 'react';
import config from '../utils/config.js';

const baseURL = config.API_URL;

const useFetch = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!endpoint) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
  setLoading(false);
  setError(new Error("Unauthorized: No token"));
  return;
}

    fetch(baseURL + endpoint, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
      .then(async res => {
        if (!res.ok) {
          let errorMessage = "Request failed";
          try {
            const errorData = await res.json();
            errorMessage = errorData?.error || JSON.stringify(errorData);
          } catch {
            errorMessage = `HTTP ${res.status} - ${res.statusText}`;
          }
          throw new Error(errorMessage);
        }

        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));

  }, [endpoint]); 

  return { data, loading, error };
};

export default useFetch;
