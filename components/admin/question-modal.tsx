"use client";

import { useEffect, useMemo, useState } from "react";
import type { Question, QuestionWriteInput } from "@/lib/models/question.model";
import type { Subtopic, Topic } from "@/lib/models/topic.model";

type QuestionModalProps = {
  open: boolean;
  mode: "create" | "edit";
  question?: Question | null;
  topics: Topic[];
  onClose: () => void;
  onSaved: () => void;
};

function formatJson(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value ?? [], null, 2);
  } catch {
    return "[]";
  }
}

function replaceFirstImageBlock(jsonText: string, uploadedUrl: string) {
  try {
    const parsed = JSON.parse(jsonText);
    let replaced = false;

    const walk = (node: any): any => {
      if (Array.isArray(node)) {
        return node.map((child) => walk(child));
      }

      if (!node || typeof node !== "object") {
        return node;
      }

      const nextNode: Record<string, any> = { ...node };

      if (
        !replaced &&
        nextNode.type === "image" &&
        typeof nextNode.value === "string" &&
        (!nextNode.value.startsWith("http") || nextNode.value.startsWith("images/"))
      ) {
        nextNode.value = uploadedUrl;
        replaced = true;
        return nextNode;
      }

      for (const key of Object.keys(nextNode)) {
        nextNode[key] = walk(nextNode[key]);
      }

      return nextNode;
    };

    const result = walk(parsed);
    return JSON.stringify(result, null, 2);
  } catch {
    return jsonText;
  }
}

export default function QuestionModal({
  open,
  mode,
  question,
  topics,
  onClose,
  onSaved,
}: QuestionModalProps) {
  const [topicId, setTopicId] = useState<number | undefined>(undefined);
  const [subtopicId, setSubtopicId] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<number>(1);

  const [titleJson, setTitleJson] = useState("[]");
  const [optionsJson, setOptionsJson] = useState("[]");
  const [explanationJson, setExplanationJson] = useState("[]");
  const [correctOption, setCorrectOption] = useState("");

  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageTarget, setImageTarget] = useState<"title" | "options" | "explanation">("title");

  const title = useMemo(() => (mode === "create" ? "Create Question" : `Edit Question #${question?.id ?? ""}`), [mode, question?.id]);

  useEffect(() => {
    if (!open) return;

    setError(null);

    if (mode === "edit" && question) {
      setTopicId(question.topic_id);
      setSubtopicId(question.subtopic_id);
      setDifficulty(question.difficulty ?? 1);
      setTitleJson(formatJson(question.title));
      setOptionsJson(formatJson(question.options));
      setExplanationJson(formatJson(question.explanation ?? []));
      setCorrectOption(formatJson(question.correct_option));
    } else {
      setTopicId(undefined);
      setSubtopicId(undefined);
      setDifficulty(1);
      setTitleJson("[]");
      setOptionsJson("[]");
      setExplanationJson("[]");
      setCorrectOption("");
    }
  }, [open, mode, question]);

  useEffect(() => {
    async function loadSubtopics() {
      if (!topicId) {
        setSubtopics([]);
        setSubtopicId(undefined);
        return;
      }

      try {
        const response = await fetch(`/api/admin/subtopics?topic_id=${topicId}`);
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.error || "Failed to load subtopics");
        }

        setSubtopics(Array.isArray(payload.data) ? payload.data : []);
      } catch (requestError) {
        console.error(requestError);
        setSubtopics([]);
      }
    }

    if (open) {
      loadSubtopics();
    }
  }, [topicId, open]);

  if (!open) {
    return null;
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    setUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok || !payload.secure_url) {
        throw new Error(payload.error?.message || "Cloudinary upload failed");
      }

      const url = String(payload.secure_url);

      if (imageTarget === "title") {
        setTitleJson((prev) => replaceFirstImageBlock(prev, url));
      } else if (imageTarget === "options") {
        setOptionsJson((prev) => replaceFirstImageBlock(prev, url));
      } else {
        setExplanationJson((prev) => replaceFirstImageBlock(prev, url));
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSave() {
    if (!topicId || !subtopicId) {
      setError("Topic and subtopic are required");
      return;
    }

    setSaving(true);
    setError(null);

    const payload: QuestionWriteInput = {
      title: titleJson,
      options: optionsJson,
      explanation: explanationJson,
      correct_option: correctOption,
      topic_id: topicId,
      subtopic_id: subtopicId,
      difficulty,
    };

    try {
      const url = mode === "create" ? "/api/admin/questions" : `/api/admin/questions/${question?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Save failed");
      }

      onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-3xl border border-foreground/10 bg-background p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            type="button"
            className="rounded-lg border border-foreground/15 px-3 py-1 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>Topic</span>
            <select
              className="rounded-xl border border-foreground/15 bg-background/60 px-3 py-2"
              value={topicId ?? ""}
              onChange={(event) => {
                setTopicId(event.target.value ? Number(event.target.value) : undefined);
                setSubtopicId(undefined);
              }}
            >
              <option value="">Select topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>Subtopic</span>
            <select
              className="rounded-xl border border-foreground/15 bg-background/60 px-3 py-2"
              value={subtopicId ?? ""}
              onChange={(event) => setSubtopicId(event.target.value ? Number(event.target.value) : undefined)}
            >
              <option value="">Select subtopic</option>
              {subtopics.map((subtopic) => (
                <option key={subtopic.id} value={subtopic.id}>
                  {subtopic.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>Difficulty</span>
            <input
              className="rounded-xl border border-foreground/15 bg-background/60 px-3 py-2"
              type="number"
              min={1}
              max={5}
              value={difficulty}
              onChange={(event) => setDifficulty(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>Title JSON</span>
            <textarea
              className="min-h-25 rounded-xl border border-foreground/15 bg-background/60 px-3 py-2 font-mono text-xs"
              value={titleJson}
              onChange={(event) => setTitleJson(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>Options JSON</span>
            <textarea
              className="min-h-25 rounded-xl border border-foreground/15 bg-background/60 px-3 py-2 font-mono text-xs"
              value={optionsJson}
              onChange={(event) => setOptionsJson(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>Explanation JSON</span>
            <textarea
              className="min-h-25 rounded-xl border border-foreground/15 bg-background/60 px-3 py-2 font-mono text-xs"
              value={explanationJson}
              onChange={(event) => setExplanationJson(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>Correct Option</span>
            <input
              className="rounded-xl border border-foreground/15 bg-background/60 px-3 py-2"
              value={correctOption}
              onChange={(event) => setCorrectOption(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-foreground/10 bg-background/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/60">Cloudinary Upload</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <select
              className="rounded-lg border border-foreground/15 bg-background/60 px-3 py-2 text-sm"
              value={imageTarget}
              onChange={(event) => setImageTarget(event.target.value as "title" | "options" | "explanation")}
            >
              <option value="title">Inject into title JSON</option>
              <option value="options">Inject into options JSON</option>
              <option value="explanation">Inject into explanation JSON</option>
            </select>
            <input type="file" accept="image/*" onChange={handleUpload} />
            {uploading ? <span className="text-xs text-foreground/70">Uploading...</span> : null}
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border border-foreground/15 px-4 py-2 text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </section>
  );
}
