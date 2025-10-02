import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ProjectTrackerProps {
  projectId: string;
}

export function ProjectTracker({ projectId }: ProjectTrackerProps) {
  const queryClient = useQueryClient();
  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);
  const [cellValue, setCellValue] = useState("");

  const { data: tracker } = useQuery({
    queryKey: ["tracker", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracker_tables")
        .select("*")
        .eq("project_id", projectId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: columns } = useQuery({
    queryKey: ["tracker-columns", tracker?.id],
    queryFn: async () => {
      if (!tracker?.id) return [];
      const { data, error } = await supabase
        .from("tracker_columns")
        .select("*")
        .eq("tracker_table_id", tracker.id)
        .order("position");

      if (error) throw error;
      return data;
    },
    enabled: !!tracker?.id,
  });

  const { data: rows } = useQuery({
    queryKey: ["tracker-rows", tracker?.id],
    queryFn: async () => {
      if (!tracker?.id) return [];
      const { data, error } = await supabase
        .from("tracker_rows")
        .select("*")
        .eq("tracker_table_id", tracker.id)
        .order("position");

      if (error) throw error;
      return data;
    },
    enabled: !!tracker?.id,
  });

  const { data: cells } = useQuery({
    queryKey: ["tracker-cells", tracker?.id],
    queryFn: async () => {
      if (!tracker?.id || !rows || rows.length === 0) return [];
      const rowIds = rows.map((r) => r.id);
      const { data, error } = await supabase
        .from("tracker_cells")
        .select("*")
        .in("tracker_row_id", rowIds);

      if (error) throw error;
      return data;
    },
    enabled: !!tracker?.id && !!rows && rows.length > 0,
  });

  // Realtime subscription
  useEffect(() => {
    if (!tracker?.id) return;

    const channel = supabase
      .channel("tracker-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tracker_cells",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["tracker-cells", tracker.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tracker?.id, queryClient]);

  const addColumn = async () => {
    if (!tracker?.id) return;
    const position = (columns?.length || 0) + 1;
    const { error } = await supabase.from("tracker_columns").insert({
      tracker_table_id: tracker.id,
      name: `Column ${position}`,
      column_type: "text",
      position,
    });

    if (error) {
      toast.error("Failed to add column");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["tracker-columns", tracker.id] });
  };

  const addRow = async () => {
    if (!tracker?.id) return;
    const position = (rows?.length || 0) + 1;
    const { error } = await supabase.from("tracker_rows").insert({
      tracker_table_id: tracker.id,
      position,
    });

    if (error) {
      toast.error("Failed to add row");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["tracker-rows", tracker.id] });
  };

  const getCellValue = (rowId: string, colId: string) => {
    const cell = cells?.find((c) => c.tracker_row_id === rowId && c.tracker_column_id === colId);
    return (cell?.value as any)?.text || "";
  };

  const updateCell = async (rowId: string, colId: string, value: string) => {
    const existingCell = cells?.find(
      (c) => c.tracker_row_id === rowId && c.tracker_column_id === colId
    );

    if (existingCell) {
      const { error } = await supabase
        .from("tracker_cells")
        .update({ value: { text: value } })
        .eq("id", existingCell.id);

      if (error) {
        toast.error("Failed to update cell");
        return;
      }
    } else {
      const { error } = await supabase.from("tracker_cells").insert({
        tracker_row_id: rowId,
        tracker_column_id: colId,
        value: { text: value },
      });

      if (error) {
        toast.error("Failed to create cell");
        return;
      }
    }

    queryClient.invalidateQueries({ queryKey: ["tracker-cells", tracker?.id] });
    setEditingCell(null);
  };

  const handleCellClick = (rowId: string, colId: string) => {
    setEditingCell({ rowId, colId });
    setCellValue(getCellValue(rowId, colId));
  };

  const handleCellBlur = () => {
    if (editingCell) {
      updateCell(editingCell.rowId, editingCell.colId, cellValue);
    }
  };

  if (!tracker) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Loading tracker...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={addColumn} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Column
        </Button>
        <Button onClick={addRow} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
      </div>

      <div className="overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-border bg-muted p-2 text-left font-semibold w-12">#</th>
              {columns?.map((col) => (
                <th key={col.id} className="border border-border bg-muted p-2 text-left font-semibold min-w-[150px]">
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows?.map((row, rowIndex) => (
              <tr key={row.id}>
                <td className="border border-border bg-muted p-2 text-center font-medium">
                  {rowIndex + 1}
                </td>
                {columns?.map((col) => {
                  const isEditing = editingCell?.rowId === row.id && editingCell?.colId === col.id;
                  return (
                    <td
                      key={col.id}
                      className="border border-border p-0"
                      onClick={() => !isEditing && handleCellClick(row.id, col.id)}
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={handleCellBlur}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCellBlur();
                            if (e.key === "Escape") setEditingCell(null);
                          }}
                          className="w-full p-2 bg-background border-none outline-none focus:ring-2 focus:ring-primary"
                          autoFocus
                        />
                      ) : (
                        <div className="p-2 min-h-[40px] cursor-pointer hover:bg-accent">
                          {getCellValue(row.id, col.id) || <span className="text-muted-foreground">Click to edit</span>}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!rows || rows.length === 0) && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Add rows and columns to start tracking</p>
        </Card>
      )}
    </div>
  );
}
