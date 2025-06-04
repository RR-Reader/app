import { useQuery } from "@tanstack/react-query";
import { SourceEntry } from "@/types";

const useFetchSourceList = () =>
  useQuery({
    queryKey: ["sourceList"],
    queryFn: async () => {
      const res = await fetch(
        "https://raw.githubusercontent.com/notreallyuri/rr_sources/refs/heads/main/sources.json",
      );

      if (!res.ok) {
        throw new Error("Failed to fetch source list");
      }

      const data: SourceEntry[] = await res.json();

      console.log("Extensions data:", data);

      return data;
    },
  });

export { useFetchSourceList };
