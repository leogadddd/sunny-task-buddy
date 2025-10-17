import React from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { WorkspaceIcon } from "../workspace-sidebar/WorkspaceIcon";
import { toast } from "sonner";

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Workspace name is required")
    .max(50, "Name must be less than 50 characters"),
  description: z.string().max(500, "Description too long").optional(),
  color: z.string().min(1, "Please select a color"),
});

type CreateWorkspaceForm = z.infer<typeof createWorkspaceSchema>;

const colorOptions = [
  "#f1594a", // accent
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#ef4444", // red
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#f97316", // orange
];

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) {
  const { createWorkspace, isLoading } = useWorkspaceStore();

  const form = useForm<CreateWorkspaceForm>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#f1594a",
    },
  });

  const watchedName = form.watch("name");
  const watchedColor = form.watch("color");

  const onSubmit = async (data: CreateWorkspaceForm) => {
    try {
      await createWorkspace({
        name: data.name,
        description: data.description,
        color: data.color,
      });
      // Success toast is handled in the store
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error toast is handled in the store
      console.error("Failed to create workspace:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to manage your projects and tasks.
          </DialogDescription>
        </DialogHeader>

        {/* Preview Card */}
        <div className="flex items-center justify-center space-y-3 p-6 bg-muted/30 rounded-xl border">
          <WorkspaceIcon
            name={watchedName || "W"}
            color={watchedColor}
            size="lg"
          />
          <div className="text-left flex flex-col ml-4 pb-3">
            <p className="text-lg font-semibold">
              {watchedName || "Workspace Name"}
            </p>
            <p className="text-sm text-muted-foreground">
              {watchedName
                ? `${watchedName.charAt(0).toUpperCase()} icon`
                : "Preview"}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter workspace name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter workspace description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            field.value === color
                              ? "border-white scale-110"
                              : "border-gray-800 hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <span className="">
                  {isLoading ? "Creating..." : "Create Workspace"}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
