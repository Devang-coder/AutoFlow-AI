import { useQuery } from "@tanstack/react-query";
import { SPREADSHEET_ID, REFRESH_INTERVAL } from "@/lib/config";

function parseGvizResponse(
  text: string
): Record<string, string | undefined>[] {
  const match = text.match(
    /google\.visualization\.Query\.setResponse\(([\s\S]*?)\);/
  );

  if (!match) return [];

  try {
    const json = JSON.parse(match[1]);
    const table = json?.table;
    if (!table) return [];

    const cols = table.cols.map((c: any) => ({
      label: (c.label || c.id || "").trim(),
      id: c.id,
    }));

    // FIX: Ensure rows is mapped and returned correctly
    return (table.rows || []).map((row: any) => {
      const obj: Record<string, string | undefined> = {};

      row.c?.forEach((cell: any, i: number) => {
        const key = cols[i]?.label || cols[i]?.id || String(i);

        if (cell?.v == null) {
          obj[key] = undefined;
        } else {
          const val = String(cell.v).trim();
          obj[key] = val.length > 0 ? val : undefined;
        }
      });

      return obj;
    });
  } catch (err) {
    console.error("GViz parse error:", err);
    return [];
  }
}

export function useSheetData<
  T extends Record<string, any> = Record<string, any>
>(sheetName: string) {
  const query = useQuery<T[]>({
    queryKey: ["sheet", sheetName],

    queryFn: async (): Promise<T[]> => {
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
        sheetName
      )}`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Failed to fetch sheet: ${sheetName}`);
      }

      const text = await res.text();
      const rawRows = parseGvizResponse(text);

      // Mapping logic for consistent casing/naming
      return rawRows.map((row) => ({
        ...row,
        agent: row.agent || row.Agent || row.agent_name,
        action: row.action || row.Action,
        result: row.result || row.Result,
        status: row.status,
        trace_id: row.trace_id,
        input_snapshot: row.input_snapshot,
        output_snapshot: row.output_snapshot,
        evidence: row.evidence,
        timestamp: row.timestamp,
        risk_level: row.risk_level,
        decision_summary: row.decision_summary,
      })) as T[];
    },

    refetchInterval: REFRESH_INTERVAL,
    staleTime: 10000,
  });

  return {
    data: query.data ?? [],
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    error: query.error,
    refresh: () => query.refetch(),
  };
}