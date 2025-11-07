/**
 * useTaskDropdown Hook
 * Manages task dropdown fields and options with optimistic updates
 * Following the optimistic update principle from the coding guide
 */

import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CREATE_DROPDOWN_FIELD,
  CREATE_DROPDOWN_OPTION,
  DELETE_DROPDOWN_FIELD,
  DELETE_DROPDOWN_OPTION,
  DESELECT_DROPDOWN_OPTION,
  GET_TASK_DROPDOWN_FIELDS,
  GET_TASK_SELECTED_OPTIONS,
  SELECT_DROPDOWN_OPTION,
  UPDATE_DROPDOWN_OPTION,
} from "../api/dropdown.api.js";

export interface DropdownOption {
  id: string;
  label: string;
  color?: string;
  order: number;
  fieldId: string;
}

export interface DropdownField {
  id: string;
  name: string;
  description?: string;
  taskId: string;
  options: DropdownOption[];
  createdAt: string;
  updatedAt: string;
}

export interface SelectedOption {
  id: string;
  taskId: string;
  optionId: string;
  option: DropdownOption;
  createdAt: string;
}

/**
 * Hook for managing task dropdown fields and selections
 */
export function useTaskDropdown(taskId: string) {
  // Queries
  const {
    data: fieldsData,
    loading: fieldsLoading,
    error: fieldsError,
    refetch: refetchFields,
  } = useQuery(GET_TASK_DROPDOWN_FIELDS, {
    variables: { taskId },
    skip: !taskId,
    errorPolicy: "all",
  });

  const {
    data: selectedData,
    loading: selectedLoading,
    error: selectedError,
    refetch: refetchSelected,
  } = useQuery(GET_TASK_SELECTED_OPTIONS, {
    variables: { taskId },
    skip: !taskId,
    errorPolicy: "all",
  });

  // Optimistic state for immediate UI updates
  const [optimisticFields, setOptimisticFields] = useState<DropdownField[]>([]);
  const [optimisticSelections, setOptimisticSelections] = useState<
    SelectedOption[]
  >([]);

  // Mutations
  const [createFieldMutation] = useMutation(CREATE_DROPDOWN_FIELD);
  const [createOptionMutation] = useMutation(CREATE_DROPDOWN_OPTION);
  const [updateOptionMutation] = useMutation(UPDATE_DROPDOWN_OPTION);
  const [deleteOptionMutation] = useMutation(DELETE_DROPDOWN_OPTION);
  const [deleteFieldMutation] = useMutation(DELETE_DROPDOWN_FIELD);
  const [selectOptionMutation] = useMutation(SELECT_DROPDOWN_OPTION);
  const [deselectOptionMutation] = useMutation(DESELECT_DROPDOWN_OPTION);

  // Combined data (optimistic + server)
  const fields = useMemo(
    () =>
      optimisticFields.length > 0
        ? optimisticFields
        : fieldsData?.taskDropdownFields || [],
    [optimisticFields, fieldsData]
  );

  const selectedOptions = useMemo(
    () =>
      optimisticSelections.length > 0
        ? optimisticSelections
        : selectedData?.taskSelectedOptions || [],
    [optimisticSelections, selectedData]
  );

  /**
   * Create a new dropdown field
   * Optimistic: Show new field immediately, rollback if fails
   */
  const createField = useCallback(
    async (name: string, description?: string) => {
      try {
        // Generate temp ID for optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticField: DropdownField = {
          id: tempId,
          name,
          description,
          taskId,
          options: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Update UI optimistically
        setOptimisticFields((prev) => [...prev, optimisticField]);

        // Execute mutation
        const result = await createFieldMutation({
          variables: { taskId, name, description },
        });

        if (result.data?.createTaskDropdownField?.success) {
          const newField = result.data.createTaskDropdownField.data;
          // Replace temp ID with real ID
          setOptimisticFields((prev) =>
            prev.map((f) => (f.id === tempId ? newField : f))
          );
          toast.success("Dropdown field created!");
          return newField;
        } else {
          // Rollback on error
          setOptimisticFields((prev) => prev.filter((f) => f.id !== tempId));
          toast.error(
            result.data?.createTaskDropdownField?.message ||
              "Failed to create field"
          );
          return null;
        }
      } catch (error) {
        // Rollback on exception
        setOptimisticFields((prev) =>
          prev.filter((f) => f.id !== `temp-${Date.now()}`)
        );
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error creating dropdown field";
        toast.error(errorMessage);
        return null;
      }
    },
    [taskId, createFieldMutation]
  );

  /**
   * Create a new dropdown option
   * Optimistic: Show new option immediately, rollback if fails
   */
  const createOption = useCallback(
    async (fieldId: string, label: string, color?: string, order?: number) => {
      try {
        const tempId = `temp-${Date.now()}`;
        const optimisticOption: DropdownOption = {
          id: tempId,
          label,
          color,
          order: order ?? 0,
          fieldId,
        };

        // Update UI optimistically - add to field's options
        setOptimisticFields((prev) =>
          prev.map((f) =>
            f.id === fieldId
              ? { ...f, options: [...f.options, optimisticOption] }
              : f
          )
        );

        // Execute mutation
        const result = await createOptionMutation({
          variables: { fieldId, label, color, order },
        });

        if (result.data?.createTaskDropdownOption?.success) {
          const newOption = result.data.createTaskDropdownOption.data;
          // Replace temp option with real one
          setOptimisticFields((prev) =>
            prev.map((f) =>
              f.id === fieldId
                ? {
                    ...f,
                    options: f.options.map((o) =>
                      o.id === tempId ? newOption : o
                    ),
                  }
                : f
            )
          );
          toast.success("Option added!");
          return newOption;
        } else {
          // Rollback
          setOptimisticFields((prev) =>
            prev.map((f) =>
              f.id === fieldId
                ? { ...f, options: f.options.filter((o) => o.id !== tempId) }
                : f
            )
          );
          toast.error(
            result.data?.createTaskDropdownOption?.message ||
              "Failed to add option"
          );
          return null;
        }
      } catch (error) {
        // Rollback on exception
        setOptimisticFields((prev) =>
          prev.map((f) =>
            f.id === fieldId
              ? {
                  ...f,
                  options: f.options.filter((o) => !o.id.startsWith("temp-")),
                }
              : f
          )
        );
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error creating dropdown option";
        toast.error(errorMessage);
        return null;
      }
    },
    [createOptionMutation]
  );

  /**
   * Update a dropdown option
   * Optimistic: Update UI immediately, rollback if fails
   */
  const updateOption = useCallback(
    async (
      optionId: string,
      label?: string,
      color?: string,
      order?: number
    ) => {
      try {
        // Find the original option for rollback
        let originalOption: DropdownOption | null = null;
        let fieldId = "";

        setOptimisticFields((prev) => {
          let found = false;
          const updated = prev.map((f) => {
            const optionIndex = f.options.findIndex((o) => o.id === optionId);
            if (optionIndex !== -1 && !found) {
              originalOption = f.options[optionIndex];
              fieldId = f.id;
              found = true;
              return {
                ...f,
                options: f.options.map((o, i) =>
                  i === optionIndex
                    ? {
                        ...o,
                        ...(label !== undefined && { label }),
                        ...(color !== undefined && { color }),
                        ...(order !== undefined && { order }),
                      }
                    : o
                ),
              };
            }
            return f;
          });
          return updated;
        });

        // Execute mutation
        const result = await updateOptionMutation({
          variables: { id: optionId, label, color, order },
        });

        if (result.data?.updateTaskDropdownOption?.success) {
          const updatedOption = result.data.updateTaskDropdownOption.data;
          setOptimisticFields((prev) =>
            prev.map((f) =>
              f.id === fieldId
                ? {
                    ...f,
                    options: f.options.map((o) =>
                      o.id === optionId ? updatedOption : o
                    ),
                  }
                : f
            )
          );
          toast.success("Option updated!");
          return updatedOption;
        } else {
          // Rollback
          if (originalOption && fieldId) {
            setOptimisticFields((prev) =>
              prev.map((f) =>
                f.id === fieldId
                  ? {
                      ...f,
                      options: f.options.map((o) =>
                        o.id === optionId ? originalOption! : o
                      ),
                    }
                  : f
              )
            );
          }
          toast.error(
            result.data?.updateTaskDropdownOption?.message ||
              "Failed to update option"
          );
          return null;
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Error updating dropdown option"
        );
        return null;
      }
    },
    [updateOptionMutation]
  );

  /**
   * Delete a dropdown option
   * Optimistic: Hide option immediately, show again if fails
   */
  const deleteOption = useCallback(
    async (optionId: string) => {
      try {
        let originalOption: DropdownOption | null = null;
        let fieldId = "";

        // Hide option optimistically
        setOptimisticFields((prev) => {
          let found = false;
          const updated = prev.map((f) => {
            const optionIndex = f.options.findIndex((o) => o.id === optionId);
            if (optionIndex !== -1 && !found) {
              originalOption = f.options[optionIndex];
              fieldId = f.id;
              found = true;
              return {
                ...f,
                options: f.options.filter((o) => o.id !== optionId),
              };
            }
            return f;
          });
          return updated;
        });

        // Execute mutation
        const result = await deleteOptionMutation({
          variables: { id: optionId },
        });

        if (result.data?.deleteTaskDropdownOption?.success) {
          toast.success("Option deleted!");
          return true;
        } else {
          // Restore option on error
          if (originalOption && fieldId) {
            setOptimisticFields((prev) =>
              prev.map((f) =>
                f.id === fieldId
                  ? { ...f, options: [...f.options, originalOption!] }
                  : f
              )
            );
          }
          toast.error(
            result.data?.deleteTaskDropdownOption?.message ||
              "Failed to delete option"
          );
          return false;
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Error deleting dropdown option"
        );
        return false;
      }
    },
    [deleteOptionMutation]
  );

  /**
   * Delete a dropdown field
   * Optimistic: Hide field immediately, show again if fails
   */
  const deleteField = useCallback(
    async (fieldId: string) => {
      try {
        let originalField: DropdownField | null = null;

        // Hide field optimistically
        setOptimisticFields((prev) => {
          const fieldToDelete = prev.find((f) => f.id === fieldId);
          if (fieldToDelete) {
            originalField = fieldToDelete;
          }
          return prev.filter((f) => f.id !== fieldId);
        });

        // Execute mutation
        const result = await deleteFieldMutation({
          variables: { id: fieldId },
        });

        if (result.data?.deleteTaskDropdownField?.success) {
          toast.success("Dropdown field deleted!");
          return true;
        } else {
          // Restore field on error
          if (originalField) {
            setOptimisticFields((prev) => [...prev, originalField!]);
          }
          toast.error(
            result.data?.deleteTaskDropdownField?.message ||
              "Failed to delete field"
          );
          return false;
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Error deleting dropdown field"
        );
        return false;
      }
    },
    [deleteFieldMutation]
  );

  /**
   * Select an option for a task
   * Optimistic: Show selection immediately, rollback if fails
   */
  const selectOption = useCallback(
    async (optionId: string) => {
      try {
        // Find the option being selected
        let optionToSelect: DropdownOption | null = null;
        for (const field of fields) {
          const option = field.options.find((o) => o.id === optionId);
          if (option) {
            optionToSelect = option;
            break;
          }
        }

        if (!optionToSelect) return null;

        const tempId = `temp-${Date.now()}`;
        const optimisticSelection: SelectedOption = {
          id: tempId,
          taskId,
          optionId,
          option: optionToSelect,
          createdAt: new Date().toISOString(),
        };

        // Add to selected optimistically
        setOptimisticSelections((prev) => [...prev, optimisticSelection]);

        // Execute mutation
        const result = await selectOptionMutation({
          variables: { taskId, optionId },
        });

        if (result.data?.selectTaskDropdownOption) {
          const newSelection = result.data.selectTaskDropdownOption;
          // Replace temp with real ID
          setOptimisticSelections((prev) =>
            prev.map((s) => (s.id === tempId ? newSelection : s))
          );
          toast.success("Option selected!");
          return newSelection;
        } else {
          // Rollback
          setOptimisticSelections((prev) =>
            prev.filter((s) => s.id !== tempId)
          );
          toast.error("Failed to select option");
          return null;
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error selecting option"
        );
        return null;
      }
    },
    [taskId, selectOptionMutation, fields]
  );

  /**
   * Deselect an option from a task
   * Optimistic: Hide selection immediately, show again if fails
   */
  const deselectOption = useCallback(
    async (optionId: string) => {
      try {
        // Hide selection optimistically
        const removedSelection = selectedOptions.find(
          (s) => s.optionId === optionId
        );
        setOptimisticSelections((prev) =>
          prev.filter((s) => s.optionId !== optionId)
        );

        // Execute mutation
        const result = await deselectOptionMutation({
          variables: { taskId, optionId },
        });

        if (result.data?.deselectTaskDropdownOption) {
          toast.success("Option deselected!");
          return true;
        } else {
          // Restore selection on error
          if (removedSelection) {
            setOptimisticSelections((prev) => [...prev, removedSelection]);
          }
          toast.error("Failed to deselect option");
          return false;
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error deselecting option"
        );
        return false;
      }
    },
    [taskId, deselectOptionMutation, selectedOptions]
  );

  return {
    // Data
    fields,
    selectedOptions,
    loading: fieldsLoading || selectedLoading,
    error: fieldsError || selectedError,

    // Methods
    createField,
    createOption,
    updateOption,
    deleteOption,
    deleteField,
    selectOption,
    deselectOption,

    // Refetch (for manual updates if needed)
    refetchFields,
    refetchSelected,

    // Helpers
    getSelectedOptionsForField: (fieldId: string) =>
      selectedOptions.filter((s) =>
        fields
          .find((f) => f.id === fieldId)
          ?.options.some((o) => o.id === s.optionId)
      ),

    isOptionSelected: (optionId: string) =>
      selectedOptions.some((s) => s.optionId === optionId),
  };
}
