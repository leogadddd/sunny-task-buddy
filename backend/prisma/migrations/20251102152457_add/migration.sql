/*
  Warnings:

  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropTable
DROP TABLE "public"."Task";

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "customFields" JSONB,
    "projectId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_dropdown_fields" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_dropdown_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_dropdown_options" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_dropdown_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_selected_options" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_selected_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_projectId_idx" ON "tasks"("projectId");

-- CreateIndex
CREATE INDEX "tasks_createdById_idx" ON "tasks"("createdById");

-- CreateIndex
CREATE INDEX "task_dropdown_fields_taskId_idx" ON "task_dropdown_fields"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "task_dropdown_fields_taskId_name_key" ON "task_dropdown_fields"("taskId", "name");

-- CreateIndex
CREATE INDEX "task_dropdown_options_fieldId_idx" ON "task_dropdown_options"("fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "task_dropdown_options_fieldId_label_key" ON "task_dropdown_options"("fieldId", "label");

-- CreateIndex
CREATE INDEX "task_selected_options_taskId_idx" ON "task_selected_options"("taskId");

-- CreateIndex
CREATE INDEX "task_selected_options_optionId_idx" ON "task_selected_options"("optionId");

-- CreateIndex
CREATE UNIQUE INDEX "task_selected_options_taskId_optionId_key" ON "task_selected_options"("taskId", "optionId");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_dropdown_fields" ADD CONSTRAINT "task_dropdown_fields_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_dropdown_options" ADD CONSTRAINT "task_dropdown_options_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "task_dropdown_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_selected_options" ADD CONSTRAINT "task_selected_options_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_selected_options" ADD CONSTRAINT "task_selected_options_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "task_dropdown_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
