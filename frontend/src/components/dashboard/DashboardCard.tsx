import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  iconColor: string;
}

/**
 * Reusable dashboard stat card component
 * Displays a metric with an icon, value, and description
 */
export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
}: DashboardCardProps) {
  return (
    <Card className="hover:shadow-lg rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <Icon className={`h-8 w-8 ${iconColor} opacity-80`} />
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-semibold mb-1">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
