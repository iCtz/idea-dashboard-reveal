import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { getListOfValues } from "@/app/dashboard/actions";

export interface ListOfValue {
  list_key: string;
  value_key: string;
  value_en: string;
  value_ar: string;
}

export const useListOfValues = (listKey: string) => {
  const [data, setData] = useState<ListOfValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchValues = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getListOfValues(listKey);
        if (result.error) {
          throw new Error(result.error);
        }
        setData(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchValues();
  }, [listKey]);

  const values = data.map(item => ({
    value: item.value_key,
    label: language === 'ar' ? item.value_ar : item.value_en,
  }));

  return { values, loading, error };
};
