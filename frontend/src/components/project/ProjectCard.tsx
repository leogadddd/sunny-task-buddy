import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ProjectContextMenu from "@/components/project/ProjectContextMenu";
import { Project } from "@/interfaces/project";
import { format } from "date-fns";
import {
  calculateTimelineProgress,
  getStatusColor,
  getStatusLabel,
} from "@/lib/project-utils";
import { Badge as TagBadge } from "@/components/ui/badge";

export default function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick?: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg hover:border-accent transition-all duration-200 group rounded-xl overflow-hidden flex flex-col h-full"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
              {project.name}
            </CardTitle>
            {project.description && (
              <CardDescription className="line-clamp-2 mt-1">
                {project.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={`flex-shrink-0 ${getStatusColor(project.status)}`}
            >
              {getStatusLabel(project.status)}
            </Badge>
            <ProjectContextMenu project={project} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-muted-foreground text-xs font-medium">Tasks</p>
              <p className="font-bold text-base mt-1">0/0</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-muted-foreground text-xs font-medium">
                Members
              </p>
              <p className="font-bold text-base mt-1">
                {project.members?.length || 0}
              </p>
            </div>
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag, index) => (
                <TagBadge key={index} variant="secondary" className="text-xs">
                  {tag}
                </TagBadge>
              ))}
              {project.tags.length > 3 && (
                <TagBadge variant="secondary" className="text-xs">
                  +{project.tags.length - 3}
                </TagBadge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <div className="px-6 pb-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground font-medium">
            Timeline Progress
          </span>
          <span className="font-semibold text-accent">
            {calculateTimelineProgress(project)}%
          </span>
        </div>
        <Progress
          value={calculateTimelineProgress(project)}
          className="h-2 rounded-full"
        />
      </div>

      <div
        className="h-1 w-full"
        style={{ backgroundColor: project.color || "#f1594a" }}
      />
    </Card>
  );
}
