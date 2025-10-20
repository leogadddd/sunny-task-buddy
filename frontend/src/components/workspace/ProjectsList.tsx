import { useState } from "react";
import { Plus, Search, Grid3X3, Table } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Project {
  id: string;
  title: string;
  description: string;
  totalTasks: number;
  completedTasks: number;
  status: "active" | "paused" | "completed";
  dueDate?: string;
  teamMembers?: number;
}

// Mock data for demonstration
const mockProjects: Project[] = [];

export default function ProjectsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Filter projects based on search query
  const filteredProjects = mockProjects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "paused":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const progressPercentage = (project: Project) => {
    return Math.round((project.completedTasks / project.totalTasks) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your projects in one place
          </p>
        </div>

        {/* Add Project Button */}
        <Button className="flex items-center">
          <Plus className="mr-2" />
          New Project
        </Button>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10 h-12 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 items-center bg-muted rounded-lg p-1.5 h-12">
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
            className="h-full px-3 rounded-md"
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-full px-3 rounded-md"
          >
            <Table className="h-4 w-4 mr-1" />
            Table
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No projects found matching your search
          </p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-lg hover:border-accent transition-all duration-200 group rounded-xl overflow-hidden flex flex-col h-full"
              onClick={() => {
                // TODO: Navigate to project details
                console.log(`Opening project: ${project.title}`);
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl group-hover:text-accent transition-colors line-clamp-2">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {project.description}
                    </CardDescription>
                  </div>
                  <Badge
                    className={`flex-shrink-0 ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status.charAt(0).toUpperCase() +
                      project.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col justify-between">
                {/* Spacer to push content to bottom */}
                <div></div>

                {/* Bottom-aligned content */}
                <div className="space-y-4">
                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">
                        Progress
                      </span>
                      <span className="font-semibold text-accent text-base">
                        {progressPercentage(project)}%
                      </span>
                    </div>
                    <Progress
                      value={progressPercentage(project)}
                      className="h-2.5 rounded-full"
                    />
                  </div>

                  {/* Stats Section */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-muted-foreground text-xs font-medium">
                        Tasks
                      </p>
                      <p className="font-bold text-base mt-1">
                        {project.completedTasks}/{project.totalTasks}
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-muted-foreground text-xs font-medium">
                        Team
                      </p>
                      <p className="font-bold text-base mt-1">
                        {project.teamMembers} members
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Footer - Stuck to bottom */}
              {project.dueDate && (
                <div className="border-t px-6 py-3 bg-muted/30">
                  <p className="text-xs text-muted-foreground font-medium">
                    Due:{" "}
                    <span className="font-semibold text-foreground">
                      {new Date(project.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <TableComponent>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    // TODO: Navigate to project details
                    console.log(`Opening project: ${project.title}`);
                  }}
                >
                  <TableCell>
                    <div>
                      <div className="font-semibold text-base">
                        {project.title}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.charAt(0).toUpperCase() +
                        project.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {progressPercentage(project)}%
                        </span>
                      </div>
                      <Progress
                        value={progressPercentage(project)}
                        className="h-2 w-24"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {project.completedTasks}/{project.totalTasks}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {project.teamMembers} members
                    </span>
                  </TableCell>
                  <TableCell>
                    {project.dueDate ? (
                      <span className="text-sm">
                        {new Date(project.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableComponent>
        </div>
      )}
    </div>
  );
}
