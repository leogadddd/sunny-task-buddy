import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Grid3X3,
  Table as TableIcon,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import CreateProjectDialog from "@/components/dialogs/CreateProjectDialog";
import ProjectCard from "@/components/project/ProjectCard";
import { Project } from "@/interfaces/project";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useProjectStore } from "@/stores/project.store";
import { useNavigate } from "react-router-dom";
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
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { toast } from "sonner";

export default function ProjectsList() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaceStore();
  const { projects, isLoading, fetchProjects, createProject, clearProjects } =
    useProjectStore();
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchProjects(currentWorkspace.id);
    } else {
      clearProjects();
    }
  }, [currentWorkspace?.id, fetchProjects, clearProjects]);

  const handleProjectClick = (project: Project) => {
    navigate(`/${currentWorkspace?.slug}/${project.slug}`);
  };

  const handleProjectCreated = (project: Project) => {
    console.log("Project created:", project);
  };

  const projectColumns: ColumnDef<Project>[] = [
    {
      key: "name",
      header: "Project",
      sortable: true,
      minWidth: 300,
      resizable: true,
      searchable: true,
      searchValue: (project) => project.name,
      tooltipText: (project) => project.name,
      cell: (project) => (
        <button
          type="button"
          onClick={() => handleProjectClick(project)}
          className="flex items-center gap-3 hover:underline text-left w-full"
        >
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: project.color || "#f1594a" }}
          />
          <div>
            <div className="font-semibold text-base">{project.name}</div>
          </div>
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      minWidth: 100,
      resizable: true,
      searchable: true,
      searchValue: (project) => getStatusLabel(project.status),
      tooltipText: (project) => getStatusLabel(project.status),
      cell: (project) => (
        <Badge className={getStatusColor(project.status)}>
          {getStatusLabel(project.status)}
        </Badge>
      ),
    },
    {
      key: "startDate",
      header: "Start Date",
      sortable: true,
      minWidth: 150,
      resizable: true,
      tooltipText: (project) =>
        project.startDate
          ? format(new Date(project.startDate), "MMM dd, yyyy")
          : "-",
      cell: (project) => (
        <span className="text-sm">
          {project.startDate
            ? format(new Date(project.startDate), "MMM dd, yyyy")
            : "-"}
        </span>
      ),
    },
    {
      key: "endDate",
      header: "End Date",
      sortable: true,
      minWidth: 150,
      resizable: true,
      tooltipText: (project) =>
        project.endDate
          ? format(new Date(project.endDate), "MMM dd, yyyy")
          : "-",
      cell: (project) => (
        <span className="text-sm">
          {project.endDate
            ? format(new Date(project.endDate), "MMM dd, yyyy")
            : "-"}
        </span>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      sortable: false,
      minWidth: 120,
      resizable: true,
      tooltipText: (project) =>
        `${Math.round(calculateTimelineProgress(project))}%`,
      cell: (project) => (
        <div className="flex flex-col items-center gap-1">
          <Progress
            value={calculateTimelineProgress(project)}
            className="h-2 w-20"
          />
        </div>
      ),
    },
    {
      key: "tasks",
      header: "Tasks",
      sortable: false,
      minWidth: 80,
      resizable: true,
      tooltipText: () => "0/0",
      cell: () => <span className="font-semibold">0/0</span>,
    },
    {
      key: "members",
      header: "Members",
      sortable: false,
      minWidth: 100,
      resizable: true,
      tooltipText: (project) => `${project.members?.length || 0} members`,
      cell: (project) => (
        <span className="font-semibold">{project.members?.length || 0}</span>
      ),
    },
    {
      key: "createdBy",
      header: "Created By",
      sortable: false,
      minWidth: 120,
      resizable: true,
      searchable: true,
      searchValue: (project) =>
        project.createdBy?.firstName || project.createdBy?.email || "Unknown",
      tooltipText: (project) =>
        project.createdBy?.firstName || project.createdBy?.email || "Unknown",
      tooltipContent: (project) => {
        const creator = project.createdBy;
        if (!creator) return null;

        return (
          <div className="space-y-3 min-w-[200px]">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: creator.color || "#f1594a" }}
              >
                {creator.image ? (
                  <img
                    src={creator.image}
                    alt={creator.firstName || creator.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  (
                    creator.firstName?.[0] ||
                    creator.username?.[0] ||
                    creator.email?.[0] ||
                    "?"
                  ).toUpperCase()
                )}
              </div>
              <div>
                <div className="font-semibold text-sm">
                  {creator.firstName && creator.lastName
                    ? `${creator.firstName} ${creator.lastName}`
                    : creator.firstName || creator.username}
                </div>
                <div className="text-xs text-muted-foreground">
                  @{creator.username}
                </div>
              </div>
            </div>
            {creator.bio && (
              <div className="text-xs text-muted-foreground border-t pt-2">
                {creator.bio}
              </div>
            )}
          </div>
        );
      },
      cell: (project) => (
        <span className="text-sm">
          {project.createdBy?.firstName ||
            project.createdBy?.email ||
            "Unknown"}
        </span>
      ),
    },
    {
      key: "tags",
      header: "Tags",
      sortable: false,
      minWidth: 120,
      resizable: true,
      searchable: true,
      searchValue: (project) =>
        project.tags && project.tags.length > 0 ? project.tags.join(" ") : "",
      tooltipText: (project) =>
        project.tags && project.tags.length > 0
          ? project.tags.join(", ")
          : "No tags",
      cell: (project) =>
        project.tags && project.tags.length > 0 ? (
          <div className="flex gap-1 items-center">
            {project.tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-1 py-0"
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
        ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      minWidth: 150,
      resizable: true,
      tooltipText: (project) =>
        format(new Date(project.createdAt), "MMM dd, yyyy"),
      cell: (project) => (
        <span className="text-sm">
          {format(new Date(project.createdAt), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated",
      sortable: true,
      minWidth: 150,
      resizable: true,
      tooltipText: (project) =>
        format(new Date(project.updatedAt), "MMM dd, yyyy"),
      cell: (project) => (
        <span className="text-sm">
          {format(new Date(project.updatedAt), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      minWidth: 50,
      resizable: false,
      isPinned: "right",
      cell: (project) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.info(`Edit project: ${project.name}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.error(`Delete project: ${project.name}`)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

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

      {/* View Toggle and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10 h-12 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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
      ) : projects.length === 0 ? (
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
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => handleProjectClick(project)}
            />
          ))}
        </div>
      ) : (
        <DataTable
          data={projects as unknown as Record<string, unknown>[]}
          columns={
            projectColumns as unknown as ColumnDef<Record<string, unknown>>[]
          }
          search={{
            enabled: true,
          }}
          searchQuery={searchQuery}
        />
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
