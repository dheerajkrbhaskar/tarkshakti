"use client";

import { useEffect, useMemo, useState } from "react";
import FilterPanel from "@/components/admin/filter-panel";
import QuestionModal from "@/components/admin/question-modal";
import QuestionTable from "@/components/admin/question-table";
import type { Question } from "@/lib/models/question.model";
import type { Topic } from "@/lib/models/topic.model";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export default function AdminQuestionsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [rows, setRows] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ topic_id?: number; subtopic_id?: number }>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    async function loadTopics() {
      try {
        const response = await fetch("/api/admin/topics");
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.error || "Failed to load topics");
        }

        setTopics(Array.isArray(payload.data) ? payload.data : []);
      } catch (error) {
        console.error(error);
        setTopics([]);
      }
    }

    loadTopics();
  }, []);

  useEffect(() => {
    void fetchQuestions(filters);
  }, [filters.topic_id, filters.subtopic_id]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (typeof filters.topic_id === "number") {
      params.set("topic_id", String(filters.topic_id));
    }
    if (typeof filters.subtopic_id === "number") {
      params.set("subtopic_id", String(filters.subtopic_id));
    }
    params.set("limit", "150");
    return params.toString();
  }, [filters]);

  async function fetchQuestions(nextFilters: { topic_id?: number; subtopic_id?: number }) {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (typeof nextFilters.topic_id === "number") {
        params.set("topic_id", String(nextFilters.topic_id));
      }
      if (typeof nextFilters.subtopic_id === "number") {
        params.set("subtopic_id", String(nextFilters.subtopic_id));
      }
      params.set("limit", "150");

      const response = await fetch(`/api/admin/questions?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to load questions");
      }

      setRows(Array.isArray(payload.data) ? payload.data : []);
    } catch (error) {
      console.error(error);
      setRows([]);
      setToast({ type: "error", message: error instanceof Error ? error.message : "Failed to load questions" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(question: Question) {
    const confirmed = window.confirm(`Delete question #${question.id}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/questions/${question.id}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Delete failed");
      }

      setToast({ type: "success", message: `Question #${question.id} deleted` });
      await fetchQuestions(filters);
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Delete failed" });
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-foreground/10 bg-white/5 p-4 shadow-sm">
      <div className="xl:sticky xl:top-4 xl:h-fit">
          <FilterPanel
            topics={topics}
            selectedTopicId={filters.topic_id}
            selectedSubtopicId={filters.subtopic_id}
            onApply={(next) => setFilters(next)}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-foreground/10 bg-background/40 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-foreground/60">Total Loaded</p>
            <p className="mt-1 text-xl font-semibold">{rows.length}</p>
          </article>
          <article className="rounded-xl border border-foreground/10 bg-background/40 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-foreground/60">Topic Filter</p>
            <p className="mt-1 text-sm font-medium">{filters.topic_id ? `ID ${filters.topic_id}` : "All topics"}</p>
          </article>
          <article className="rounded-xl border border-foreground/10 bg-background/40 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-foreground/60">Subtopic Filter</p>
            <p className="mt-1 text-sm font-medium">{filters.subtopic_id ? `ID ${filters.subtopic_id}` : "All subtopics"}</p>
          </article>
        </div>
      </div>

      <div className="">
        

        <div className="rounded-2xl border border-foreground/10 bg-white/5 p-3 shadow-sm">
          <QuestionTable
            rows={rows}
            loading={loading}
            onEdit={(question) => {
              setActiveQuestion(question);
              setModalMode("edit");
              setModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <QuestionModal
        open={modalOpen}
        mode={modalMode}
        question={activeQuestion}
        topics={topics}
        onClose={() => setModalOpen(false)}
        onSaved={async () => {
          setToast({ type: "success", message: modalMode === "create" ? "Question created" : "Question updated" });
          await fetchQuestions(filters);
        }}
      />

      {toast ? (
        <div
          className={`fixed bottom-5 right-5 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </section>
  );
}
