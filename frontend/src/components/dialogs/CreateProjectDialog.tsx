import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useProjectStore } from "@/stores/project.store";
import { CreateProjectInput, Project } from "@/interfaces/project";
import { toast } from "sonner";
import {
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Palette,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be less than 100 characters"),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(["planning", "active", "completed", "archived"]).optional(),
  color: z.string().optional(),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (project: Project) => void;
}

const statusOptions = [
  {
    value: "planning",
    label: "Planning",
  },
  { value: "active", label: "Active" },
  {
    value: "completed",
    label: "Completed",
  },
  { value: "archived", label: "Archived" },
];

const colorOptions = [
  { value: "#f1594a", label: "Red", color: "#f1594a" },
  { value: "#3b82f6", label: "Blue", color: "#3b82f6" },
  { value: "#10b981", label: "Green", color: "#10b981" },
  { value: "#f59e0b", label: "Orange", color: "#f59e0b" },
  { value: "#8b5cf6", label: "Purple", color: "#8b5cf6" },
  { value: "#ef4444", label: "Pink", color: "#ef4444" },
  { value: "#6b7280", label: "Gray", color: "#6b7280" },
];

export default function CreateProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectDialogProps) {
  const { currentWorkspace } = useWorkspaceStore();
  const { createProject } = useProjectStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate default dates: today and 12 days from now
  const today = new Date();
  const defaultEndDate = new Date();
  defaultEndDate.setDate(today.getDate() + 12);

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: today,
      endDate: defaultEndDate,
      status: "planning",
      color: "#f1594a",
    },
  });

  const steps = [
    {
      title: "Project Details",
      description: "Enter basic project information",
    },
    {
      title: "Configuration",
      description: "Set dates, status, and appearance",
    },
  ];

  const resetForm = () => {
    form.reset();
    setCurrentStep(0);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleNext = async (e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevent any default behavior

    // Validate current step fields
    if (currentStep === 0) {
      const nameValid = await form.trigger("name");
      const descriptionValid = await form.trigger("description");

      if (nameValid && descriptionValid) {
        setCurrentStep(1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CreateProjectForm) => {
    if (!currentWorkspace) {
      toast.error("No workspace selected");
      return;
    }

    try {
      setIsSubmitting(true);

      const projectInput: CreateProjectInput = {
        name: data.name,
        description: data.description,
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        status: data.status || "planning",
        color: data.color || "#f1594a",
        workspaceId: currentWorkspace.id,
      };

      const newProject = await createProject(projectInput);

      // Call callback if provided
      if (onProjectCreated) {
        onProjectCreated(newProject);
      }

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      // Error toast is handled by toast.promise
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="Enter project name"
                {...form.register("name")}
                className={cn(
                  form.formState.errors.name && "border-destructive"
                )}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description (optional)"
                rows={3}
                {...form.register("description")}
                className="resize-none"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch("startDate") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("startDate") ? (
                        format(form.watch("startDate")!, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch("startDate")}
                      onSelect={(date) => form.setValue("startDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch("endDate") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("endDate") ? (
                        format(form.watch("endDate")!, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch("endDate")}
                      onSelect={(date) => form.setValue("endDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) =>
                  form.setValue(
                    "status",
                    value as "planning" | "active" | "completed" | "archived"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{status.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Color Theme</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => form.setValue("color", colorOption.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                      form.watch("color") === colorOption.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colorOption.color }}
                    />
                    <span className="text-sm">{colorOption.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            {steps[currentStep].description} in{" "}
            <span className="font-semibold text-foreground">
              {currentWorkspace?.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  index <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              <div className="ml-2 hidden sm:block">
                <p
                  className={cn(
                    "text-sm font-medium",
                    index <= currentStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block mx-4 h-px w-12 transition-colors",
                    index < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            // Prevent form submission on Enter key, except on the last step
            if (e.key === "Enter" && currentStep < steps.length - 1) {
              e.preventDefault();
              handleNext();
            }
          }}
        >
          {renderStepContent()}

          <DialogFooter className="mt-6">
            <div className="flex justify-between w-full">
              <div>
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isSubmitting}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
