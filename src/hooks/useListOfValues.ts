import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { db } from "@lib/db";
import { logger } from "@/lib/logger";

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
        const valuesData = await db.listOfValue.findMany({
          where: {
            list_key: listKey,
            is_active: true,
          },
          orderBy: {
            value_ar: 'asc',
          },
        }); // Order by Arabic by default

        if (!valuesData) throw new Error('No data found');
        setData(valuesData || []);
      } catch (error) {
        logger.error("Error fetching list of values:", error as string);
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
