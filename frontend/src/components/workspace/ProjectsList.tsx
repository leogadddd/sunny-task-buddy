import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Grid3X3,
  Table as TableIcon,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import CreateProjectDialog from "@/components/dialogs/CreateProjectDialog";
import ProjectCard from "@/components/project/ProjectCard";
import { Project } from "@/interfaces/project";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useProjectStore } from "@/stores/project.store";
import { format } from "date-fns";
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  getStatusColor,
  getStatusLabel,
  calculateTimelineProgress,
} from "@/lib/project-utils";

export default function ProjectsList() {
  const { currentWorkspace } = useWorkspaceStore();
  const { projects, isLoading, fetchProjects, createProject, clearProjects } =
    useProjectStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchProjects(currentWorkspace.id);
    } else {
      clearProjects();
    }
  }, [currentWorkspace?.id, fetchProjects, clearProjects]);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description &&
        project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleProjectCreated = (project: Project) => {
    console.log("Project created:", project);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your projects in one place
          </p>
        </div>

        {/* Add Project Button */}
        <Button
          className="flex items-center"
          onClick={() => setIsCreateDialogOpen(true)}
        >
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
            <TableIcon className="h-4 w-4 mr-1" />
            Table
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {projects.length === 0 ? (
              <>
                No projects found.{" "}
                <button
                  className="text-primary hover:underline"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  Create your first project
                </button>
              </>
            ) : (
              "No projects found matching your search"
            )}
          </p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => console.log(`Opening project: ${project.name}`)}
            />
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
                <TableHead>Members</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    // TODO: Navigate to project details
                    console.log(`Opening project: ${project.name}`);
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color || "#f1594a" }}
                      />
                      <div>
                        <div className="font-semibold text-base">
                          {project.name}
                        </div>
                        {project.description && (
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2 min-w-[120px]">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {calculateTimelineProgress(project)}%
                        </span>
                      </div>
                      <Progress
                        value={calculateTimelineProgress(project)}
                        className="h-2 w-24"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">0/0</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {project.members?.length || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    {project.tags && project.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 2).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{project.tags.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {format(new Date(project.createdAt), "MMM dd, yyyy")}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableComponent>
        </div>
      )}

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
