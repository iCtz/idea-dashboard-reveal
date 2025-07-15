import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

export interface ListOfValue {
  id: number;
  list_key: string;
  value_key: string;
  value_en: string;
  value_ar: string;
  is_active: boolean | null;
}

export const useListOfValues = (listKey: string) => {
  const [data, setData] = useState<ListOfValue[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchValues = async () => {
      try {
        const { data, error } = await supabase
          .from("list_of_values")
          .select("*")
          .eq("list_key", listKey)
          .eq("is_active", true)
          .order("value_ar"); // Order by Arabic by default

        if (error) throw error;
        setData(data || []);
      } catch (error) {
        console.error("Error fetching list of values:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchValues();
  }, [listKey]);

  // Convert data to dropdown format
  const values = data.map(item => ({
    value: item.value_key,
    label: language === 'ar' ? item.value_ar : item.value_en,
  }));

  return { values, loading };
};
