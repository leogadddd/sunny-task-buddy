/**
 * Example: Task Dropdown UI Component
 * Demonstrates how to use the useTaskDropdown hook
 *
 * This is a reference implementation - customize styles to match your design
 */

import { useState } from "react";
import { useTaskDropdown } from "@/hooks/useTaskDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";

interface TaskDropdownsProps {
  taskId: string;
}

/**
 * Main component for managing task dropdowns
 */
export function TaskDropdowns({ taskId }: TaskDropdownsProps) {
  const {
    fields,
    selectedOptions,
    loading,
    createField,
    createOption,
    updateOption,
    deleteOption,
    deleteField,
    selectOption,
    deselectOption,
    isOptionSelected,
  } = useTaskDropdown(taskId);

  const [showNewFieldDialog, setShowNewFieldDialog] = useState(false);
  const [showNewOptionDialog, setShowNewOptionDialog] = useState<string | null>(
    null
  );
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldDescription, setNewFieldDescription] = useState("");
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionColor, setNewOptionColor] = useState("#3b82f6");
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);

  const handleCreateField = async () => {
    if (!newFieldName.trim()) return;

    const field = await createField(newFieldName, newFieldDescription);
    if (field) {
      setNewFieldName("");
      setNewFieldDescription("");
      setShowNewFieldDialog(false);
    }
  };

  const handleCreateOption = async (fieldId: string) => {
    if (!newOptionLabel.trim()) return;

    const option = await createOption(fieldId, newOptionLabel, newOptionColor);
    if (option) {
      setNewOptionLabel("");
      setNewOptionColor("#3b82f6");
      setShowNewOptionDialog(null);
    }
  };

  const handleToggleOption = async (optionId: string) => {
    if (isOptionSelected(optionId)) {
      await deselectOption(optionId);
    } else {
      await selectOption(optionId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Task Properties</h2>
        <Button
          onClick={() => setShowNewFieldDialog(true)}
          size="sm"
          variant="outline"
        >
          <Plus className="mr-2" size={16} />
          Add Property
        </Button>
      </div>

      {/* Dropdown Fields */}
      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p>No properties yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-3">
              {/* Field Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{field.name}</h3>
                  {field.description && (
                    <p className="text-sm text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => deleteField(field.id)}
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-2">
                {field.options.map((option) => (
                  <div
                    key={option.id}
                    className="group relative inline-flex items-center"
                  >
                    <button
                      onClick={() => handleToggleOption(option.id)}
                      className={`
                        rounded-full px-4 py-2 text-sm font-medium transition-all
                        ${
                          isOptionSelected(option.id)
                            ? "ring-2 ring-offset-2"
                            : "opacity-75 hover:opacity-100"
                        }
                      `}
                      style={{
                        backgroundColor: option.color || "#e5e7eb",
                      }}
                    >
                      {option.label}
                    </button>

                    {/* Delete on hover */}
                    <button
                      onClick={() => deleteOption(option.id)}
                      className="
                        absolute -right-2 -top-2 hidden rounded-full 
                        bg-destructive p-1 text-white group-hover:block
                      "
                      title="Delete option"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {/* Add Option Button */}
                <Button
                  onClick={() => setShowNewOptionDialog(field.id)}
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Field Dialog */}
      <Dialog open={showNewFieldDialog} onOpenChange={setShowNewFieldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Property Name</label>
              <Input
                placeholder="e.g., Status, Priority, Category"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Optional description"
                value={newFieldDescription}
                onChange={(e) => setNewFieldDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateField}
                className="flex-1"
                disabled={!newFieldName.trim()}
              >
                Create
              </Button>
              <Button
                onClick={() => setShowNewFieldDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Option Dialog */}
      {showNewOptionDialog && (
        <Dialog
          open={!!showNewOptionDialog}
          onOpenChange={() => setShowNewOptionDialog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Option</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Option Label</label>
                <Input
                  placeholder="e.g., In Progress, High Priority"
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newOptionColor}
                    onChange={(e) => setNewOptionColor(e.target.value)}
                    className="h-10 w-20 cursor-pointer rounded"
                  />
                  <span className="text-sm text-muted-foreground">
                    {newOptionColor}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCreateOption(showNewOptionDialog)}
                  className="flex-1"
                  disabled={!newOptionLabel.trim()}
                >
                  Add Option
                </Button>
                <Button
                  onClick={() => setShowNewOptionDialog(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/**
 * Minimal version - Just show options as buttons
 */
export function TaskDropdownsCompact({ taskId }: TaskDropdownsProps) {
  const {
    fields,
    selectedOptions,
    isOptionSelected,
    selectOption,
    deselectOption,
  } = useTaskDropdown(taskId);

  return (
    <div className="space-y-2">
      {fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">
            {field.name}
          </label>
          <div className="flex flex-wrap gap-1">
            {field.options.map((option) => (
              <button
                key={option.id}
                onClick={() =>
                  isOptionSelected(option.id)
                    ? deselectOption(option.id)
                    : selectOption(option.id)
                }
                className={`
                  rounded px-2 py-1 text-xs font-medium transition-all
                  ${
                    isOptionSelected(option.id)
                      ? "ring-1 ring-offset-1"
                      : "opacity-60 hover:opacity-100"
                  }
                `}
                style={{
                  backgroundColor: option.color || "#e5e7eb",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
