-- CreateTable
CREATE TABLE "LecturerModuleAssignment" (
    "lecturerId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("lecturerId", "moduleId"),
    CONSTRAINT "LecturerModuleAssignment_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LecturerModuleAssignment_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LecturerModuleAssignment_moduleId_idx" ON "LecturerModuleAssignment"("moduleId");
