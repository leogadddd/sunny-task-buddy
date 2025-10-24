import { Project } from "@/interfaces/project";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "planning":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "archived":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const calculateTimelineProgress = (project: Project): number => {
  if (!project.startDate || !project.endDate) return 0;

  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const currentDate = new Date();

  // If project hasn't started yet
  if (currentDate < startDate) return 0;

  // If project is past end date
  if (currentDate > endDate) return 100;

  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsedDuration = currentDate.getTime() - startDate.getTime();

  return Math.round((elapsedDuration / totalDuration) * 100);
};
