import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  tooltipText?: (item: T) => string;
  tooltipContent?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  isPinned?: "left" | "right";
  searchable?: boolean; // Whether this column should be included in search
  searchValue?: (item: T) => string; // Custom search value extractor
}

export interface SearchConfig {
  enabled?: boolean;
  searchKeys?: string[]; // Specific keys to search in, if not provided, uses searchable columns
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  className?: string;
  onRowClick?: (item: T) => void;
  search?: SearchConfig;
  searchQuery?: string; // External search query
}

// Base table component for rendering columns
interface BaseTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (item: T) => void;
  className?: string;
  borderClass?: string;
}

function BaseTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  className,
  borderClass,
}: BaseTableProps<T>) {
  return (
    <div className={cn("flex flex-col bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={cn(
                  column.className,
                  "truncate max-w-0",
                  borderClass
                )}
                style={{ width: "max-content", minWidth: column.minWidth }}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={index}
              className={cn(
                onRowClick && "cursor-pointer hover:bg-popover",
                "transition-colors h-16"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => {
                const cellContent = column.cell
                  ? column.cell(item)
                  : String(item[column.key as keyof T] || "");

                const isTextContent = typeof cellContent === "string";

                return (
                  <TableCell
                    key={String(column.key)}
                    className={cn(
                      column.className,
                      isTextContent && "truncate max-w-0",
                      "align-middle",
                      borderClass
                    )}
                    style={{ minWidth: column.minWidth }}
                  >
                    {cellContent}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Left table component
export function LeftTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  className,
}: BaseTableProps<T>) {
  return (
    <BaseTable
      data={data}
      columns={columns}
      onRowClick={onRowClick}
      className={cn("border-r", className)}
      borderClass="border-r"
    />
  );
}

// Center table component (default)
export function CenterTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  className,
}: BaseTableProps<T>) {
  return (
    <BaseTable
      data={data}
      columns={columns}
      onRowClick={onRowClick}
      className={className}
    />
  );
}

// Right table component
export function RightTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  className,
}: BaseTableProps<T>) {
  return (
    <BaseTable
      data={data}
      columns={columns}
      onRowClick={onRowClick}
      className={cn("border-l", className)}
      borderClass="border-l"
    />
  );
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  className,
  onRowClick,
  search,
  searchQuery = "",
}: DataTableProps<T>) {
  // Get searchable columns
  const searchableColumns = useMemo(() => {
    if (search?.searchKeys) {
      return columns.filter((col) =>
        search.searchKeys!.includes(String(col.key))
      );
    }
    return columns.filter((col) => col.searchable !== false); // Default to searchable unless explicitly false
  }, [columns, search?.searchKeys]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!search?.enabled || !searchQuery.trim()) {
      return data;
    }

    const query = searchQuery.toLowerCase().trim();
    return data.filter((item) => {
      return searchableColumns.some((column) => {
        const searchValue = column.searchValue
          ? column.searchValue(item)
          : String(item[column.key as keyof T] || "").toLowerCase();
        return searchValue.includes(query);
      });
    });
  }, [data, searchQuery, searchableColumns, search?.enabled]);

  const leftColumns = columns.filter((col) => col.isPinned === "left");
  const rightColumns = columns.filter((col) => col.isPinned === "right");
  const centerColumns = columns.filter((col) => !col.isPinned);

  if (filteredData.length === 0 && data.length > 0 && searchQuery.trim()) {
    return (
      <TooltipProvider>
        <div className={cn("", className)}>
          <div className="flex">
            {/* Left pinned table */}
            {leftColumns.length > 0 && (
              <div className="flex-shrink-0 border-r bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {leftColumns.map((column) => (
                        <TableHead
                          key={String(column.key)}
                          className={cn(
                            column.className,
                            "truncate max-w-0 border-r bg-card"
                          )}
                          style={{
                            width: "max-content",
                            minWidth: column.minWidth,
                          }}
                        >
                          {column.header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="h-24">
                      <TableCell
                        colSpan={leftColumns.length}
                        className="text-center text-muted-foreground"
                      >
                        No results found for "{searchQuery}"
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Center scrollable table */}
            <div className="flex-1 overflow-x-auto border-r bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    {centerColumns.map((column) => (
                      <TableHead
                        key={String(column.key)}
                        className={cn(column.className, "truncate max-w-0")}
                        style={{
                          width: "max-content",
                          minWidth: column.minWidth,
                        }}
                      >
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="h-24">
                    <TableCell
                      colSpan={centerColumns.length}
                      className="text-center text-muted-foreground"
                    >
                      {leftColumns.length === 0
                        ? `No results found for "${searchQuery}"`
                        : ""}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Right pinned table */}
            {rightColumns.length > 0 && (
              <div className="flex-shrink-0 bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {rightColumns.map((column) => (
                        <TableHead
                          key={String(column.key)}
                          className={cn(
                            column.className,
                            "truncate max-w-0 border-l bg-card"
                          )}
                          style={{
                            width: "max-content",
                            minWidth: column.minWidth,
                          }}
                        >
                          {column.header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="h-24">
                      <TableCell
                        colSpan={rightColumns.length}
                        className="text-center text-muted-foreground"
                      >
                        {/* Empty for right table */}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  if (data.length === 0) {
    return (
      <TooltipProvider>
        <div className={cn("", className)}>
          <div className="flex">
            {/* Left pinned table */}
            {leftColumns.length > 0 && (
              <div className="flex-shrink-0 border-r bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {leftColumns.map((column) => (
                        <TableHead
                          key={String(column.key)}
                          className={cn(
                            column.className,
                            "truncate max-w-0 border-r bg-card"
                          )}
                          style={{
                            width: "max-content",
                            minWidth: column.minWidth,
                          }}
                        >
                          {column.header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="h-24">
                      <TableCell
                        colSpan={leftColumns.length}
                        className="text-center text-muted-foreground"
                      >
                        No data available
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Center scrollable table */}
            <div className="flex-1 overflow-x-scroll border-r bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    {centerColumns.map((column) => (
                      <TableHead
                        key={String(column.key)}
                        className={cn(column.className, "truncate max-w-0")}
                        style={{
                          width: "max-content",
                          minWidth: column.minWidth,
                        }}
                      >
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="h-24">
                    <TableCell
                      colSpan={centerColumns.length}
                      className="text-center text-muted-foreground"
                    >
                      {leftColumns.length === 0 ? "No data available" : ""}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Right pinned table */}
            {rightColumns.length > 0 && (
              <div className="flex-shrink-0 bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {rightColumns.map((column) => (
                        <TableHead
                          key={String(column.key)}
                          className={cn(
                            column.className,
                            "truncate max-w-0 border-l bg-card"
                          )}
                          style={{
                            width: "max-content",
                            minWidth: column.minWidth,
                          }}
                        >
                          {column.header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="h-24">
                      <TableCell
                        colSpan={rightColumns.length}
                        className="text-center text-muted-foreground"
                      >
                        {/* Empty for right table */}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  const renderCell = (column: ColumnDef<T>, item: T) => {
    const cellContent = column.cell
      ? column.cell(item)
      : String(item[column.key as keyof T] || "");

    // Get tooltip content - prioritize custom tooltipContent over tooltipText
    const tooltipContent = column.tooltipContent
      ? column.tooltipContent(item)
      : column.tooltipText
      ? column.tooltipText(item)
      : typeof cellContent === "string"
      ? cellContent
      : "";

    const shouldShowTooltip =
      tooltipContent !== "" &&
      tooltipContent !== null &&
      tooltipContent !== undefined;

    const cellContentWithTooltip = shouldShowTooltip ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full h-full">{cellContent}</div>
        </TooltipTrigger>
        <TooltipContent>
          {typeof tooltipContent === "string" ? (
            <p className="max-w-xs break-words">{tooltipContent}</p>
          ) : (
            tooltipContent
          )}
        </TooltipContent>
      </Tooltip>
    ) : (
      cellContent
    );

    return (
      <TableCell
        key={String(column.key)}
        className={cn(column.className, "align-middle")}
        style={{ minWidth: column.minWidth }}
      >
        {cellContentWithTooltip}
      </TableCell>
    );
  };

  return (
    <TooltipProvider>
      <div className={cn("", className)}>
        <div className="flex">
          {/* Left pinned table */}
          {leftColumns.length > 0 && (
            <div className="flex-shrink-0 border-r bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    {leftColumns.map((column) => (
                      <TableHead
                        key={String(column.key)}
                        className={cn(
                          column.className,
                          "truncate max-w-0 border-r bg-card"
                        )}
                        style={{
                          width: "max-content",
                          minWidth: column.minWidth,
                        }}
                      >
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow
                      key={index}
                      className={cn(
                        onRowClick && "cursor-pointer hover:bg-popover",
                        "transition-colors h-16"
                      )}
                      onClick={() => onRowClick?.(item)}
                    >
                      {leftColumns.map((column) => renderCell(column, item))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Center scrollable table */}
          <div className="flex-1 overflow-x-scroll border-r bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  {centerColumns.map((column) => (
                    <TableHead
                      key={String(column.key)}
                      className={cn(column.className, "truncate max-w-0")}
                      style={{
                        width: "max-content",
                        minWidth: column.minWidth,
                      }}
                    >
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow
                    key={index}
                    className={cn(
                      onRowClick && "cursor-pointer hover:bg-popover",
                      "transition-colors h-16"
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {centerColumns.map((column) => renderCell(column, item))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Right pinned table */}
          {rightColumns.length > 0 && (
            <div className="flex-shrink-0 bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    {rightColumns.map((column) => (
                      <TableHead
                        key={String(column.key)}
                        className={cn(
                          column.className,
                          "truncate max-w-0 border-l bg-card"
                        )}
                        style={{
                          width: "max-content",
                          minWidth: column.minWidth,
                        }}
                      >
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow
                      key={index}
                      className={cn(
                        onRowClick && "cursor-pointer hover:bg-popover",
                        "transition-colors h-16"
                      )}
                      onClick={() => onRowClick?.(item)}
                    >
                      {rightColumns.map((column) => renderCell(column, item))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
