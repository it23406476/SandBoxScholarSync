'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createModuleAction,
  deleteModuleAction,
  getLecturerDashboardData,
  updateModuleAction,
} from '@/actions/lecturer.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Trash2, Plus } from 'lucide-react';

type ModuleForm = {
  code: string;
  name: string;
  healthReportUrl: string;
};

const CODE_REGEX = /^[A-Z]{2,4}\d{3,4}$/;
const NAME_REGEX = /^[A-Za-z0-9&(),./\-\s]{3,100}$/;

const emptyForm: ModuleForm = {
  code: '',
  name: '',
  healthReportUrl: '',
};

export function ModuleManagement() {
  const [modules, setModules] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ModuleForm>(emptyForm);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  const isFormValid = useMemo(
    () => CODE_REGEX.test(form.code.trim().toUpperCase()) && NAME_REGEX.test(form.name.trim()),
    [form.code, form.name]
  );

  const loadModules = useCallback(async () => {
    const result = await getLecturerDashboardData();
    if (!result.success) {
      setError(result.message);
      return;
    }

    setModules(result.data.assignedModules);
  }, []);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      setLoading(true);
      setError(null);
      await loadModules();
      if (active) {
        setLoading(false);
      }
    }

    hydrate();

    const timer = setInterval(
      () => {
        loadModules();
      },
      3 * 60 * 1000
    );

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [loadModules]);

  async function handleCreateOrUpdate() {
    setError(null);
    setMessage(null);

    if (!isFormValid) {
      setError('Please enter a valid module code and module name.');
      return;
    }

    setSubmitting(true);

    try {
      if (editingModuleId) {
        const result = await updateModuleAction({
          moduleId: editingModuleId,
          code: form.code,
          name: form.name,
          healthReportUrl: form.healthReportUrl || null,
        });

        if (!result.success) {
          setError(result.message);
          return;
        }

        setMessage(result.message ?? 'Module updated successfully.');
      } else {
        const result = await createModuleAction({
          code: form.code,
          name: form.name,
          healthReportUrl: form.healthReportUrl || undefined,
        });

        if (!result.success) {
          setError(result.message);
          return;
        }

        setMessage(result.message ?? 'Module created successfully.');
      }

      setForm(emptyForm);
      setEditingModuleId(null);
      await loadModules();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(moduleId: string) {
    setError(null);
    setMessage(null);

    setSubmitting(true);
    try {
      const result = await deleteModuleAction(moduleId);
      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message ?? 'Module deleted successfully.');
      await loadModules();
    } finally {
      setSubmitting(false);
    }
  }

  function beginEdit(module: { id: string; code: string; name: string }) {
    setEditingModuleId(module.id);
    setForm({ code: module.code, name: module.name, healthReportUrl: '' });
    setMessage(null);
    setError(null);
  }

  function resetEditor() {
    setEditingModuleId(null);
    setForm(emptyForm);
    setError(null);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {editingModuleId ? 'Edit Module' : 'Create Module'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Code (e.g. IT3040)"
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
            />
            <Input
              placeholder="Module name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Input
              placeholder="Health report URL (optional)"
              value={form.healthReportUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, healthReportUrl: event.target.value }))
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleCreateOrUpdate} disabled={submitting || !isFormValid}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                </>
              ) : editingModuleId ? (
                <>
                  <Pencil className="h-4 w-4 mr-1" /> Update Module
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" /> Create Module
                </>
              )}
            </Button>

            {editingModuleId ? (
              <Button type="button" variant="outline" onClick={resetEditor}>
                Cancel Edit
              </Button>
            ) : null}
          </div>

          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assigned Modules</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading modules...
            </div>
          ) : modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No modules assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{module.code}</p>
                    <p className="text-sm text-muted-foreground">{module.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => beginEdit(module)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(module.id)}
                      disabled={submitting}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
