"use client";

import { useEffect, useMemo, useState } from "react";
import type { Question } from "@/lib/models/question.model";
import { contentValueToText, normalizeContentBlocks, normalizeOptionItems } from "@/lib/questions/content";

type QuestionTableProps = {
  rows: Question[];
  loading?: boolean;
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
};

function getImageCount(value: unknown) {
  return normalizeContentBlocks(value).filter((block) => block.type === "image").length;
}

function getDisplayText(value: unknown) {
  const text = contentValueToText(value).trim();
  if (text) {
    return text;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "-";
  }
}

function resolveImageSrc(raw: string) {
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) {
    return raw;
  }

  return `/${raw}`;
}

function renderBlocks(value: unknown) {
  const blocks = normalizeContentBlocks(value);
  if (!blocks.length) {
    return <p className="text-sm text-foreground/70">-</p>;
  }

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        if (block.type === "image") {
          return (
            <a
              key={`${block.value}-${index}`}
              href={resolveImageSrc(block.value)}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <img
                src={resolveImageSrc(block.value)}
                alt={`Question image ${index + 1}`}
                className="max-h-36 w-auto max-w-full rounded-lg border border-foreground/10"
              />
            </a>
          );
        }

        return (
          <p key={`${block.value}-${index}`} className="whitespace-pre-wrap wrap-break-word text-sm">
            {block.value}
          </p>
        );
      })}
    </div>
  );
}

function renderOptions(options: unknown) {
  const normalized = normalizeOptionItems(options);

  if (!normalized.length) {
    return <p className="text-sm text-foreground/70">-</p>;
  }

  return (
    <ul className="space-y-2">
      {normalized.map((option, index) => (
        <li key={`${option.value}-${index}`} className="rounded-lg border border-foreground/10 p-2">
          <p className="mb-1 text-xs font-semibold text-foreground/60">Option {index + 1}</p>
          {option.blocks.length > 0 ? renderBlocks(option.blocks) : <p className="text-sm wrap-break-word">{option.text || option.value}</p>}
        </li>
      ))}
    </ul>
  );
}

export default function QuestionTable({ rows, loading, onEdit, onDelete }: QuestionTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"id-desc" | "id-asc" | "difficulty-desc" | "difficulty-asc">("id-desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const list = rows.filter((row) => {
      if (!normalizedSearch) return true;

      const haystack = [
        row.id,
        row.topic_id,
        row.subtopic_id,
        row.difficulty,
        contentValueToText(row.title),
        contentValueToText(row.options),
        contentValueToText(row.correct_option),
        contentValueToText(row.explanation),
      ]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");

      return haystack.includes(normalizedSearch);
    });

    const sorted = [...list].sort((left, right) => {
      switch (sortKey) {
        case "id-asc":
          return left.id - right.id;
        case "id-desc":
          return right.id - left.id;
        case "difficulty-asc":
          return (left.difficulty ?? 0) - (right.difficulty ?? 0);
        case "difficulty-desc":
          return (right.difficulty ?? 0) - (left.difficulty ?? 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [rows, search, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((row) => selectedIds.has(row.id));

  useEffect(() => {
    setPage(1);
  }, [search, sortKey, pageSize]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<number>();
      for (const id of prev) {
        if (rows.some((row) => row.id === id)) {
          next.add(id);
        }
      }
      return next;
    });
  }, [rows]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function toggleVisibleSelection(nextChecked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const row of visibleRows) {
        if (nextChecked) {
          next.add(row.id);
        } else {
          next.delete(row.id);
        }
      }
      return next;
    });
  }

  function toggleRowSelection(id: number, nextChecked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (nextChecked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-foreground/10 bg-background/30 p-4 text-sm text-foreground/70">
        Loading questions...
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-foreground/10 bg-background/30 p-4 text-sm text-foreground/70">
        No questions found for selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-background/30 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground/70">Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, id, option text..."
              className="rounded-xl border border-foreground/15 bg-background/60 px-3 py-2 text-sm outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground/70">Sort</span>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
              className="rounded-xl border border-foreground/15 bg-background/60 px-3 py-2 text-sm outline-none"
            >
              <option value="id-desc">Newest first</option>
              <option value="id-asc">Oldest first</option>
              <option value="difficulty-desc">Difficulty high to low</option>
              <option value="difficulty-asc">Difficulty low to high</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground/70">Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="rounded-xl border border-foreground/15 bg-background/60 px-3 py-2 text-sm outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>

          <div className="flex items-end gap-2 text-sm text-foreground/70">
            <span className="rounded-xl border border-foreground/10 px-3 py-2">Filtered: {filteredRows.length}</span>
            <span className="rounded-xl border border-foreground/10 px-3 py-2">Selected: {selectedIds.size}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl border border-foreground/15 px-3 py-2 text-sm font-semibold transition hover:border-accent hover:text-accent"
            onClick={() => setSearch("")}
          >
            Clear search
          </button>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <div className="rounded-2xl border border-foreground/10 bg-background/30 p-4 text-sm text-foreground/70">
          No questions match your current search or filters.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-foreground/10">
            <table className="w-full min-w-245 text-left text-sm">
              <thead className="sticky top-0 z-10 bg-background/90 text-foreground/70 backdrop-blur">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(event) => toggleVisibleSelection(event.target.checked)}
                      aria-label="Select visible questions"
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Topic</th>
                  <th className="px-4 py-3 font-semibold">Subtopic</th>
                  <th className="px-4 py-3 font-semibold">Difficulty</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Options</th>
                  <th className="px-4 py-3 font-semibold">Correct Option</th>
                  <th className="px-4 py-3 font-semibold">Images</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const titleImages = getImageCount(row.title);
                  const optionsImages = getImageCount(row.options);
                  const explanationImages = getImageCount(row.explanation);
                  const correctOptionText = getDisplayText(row.correct_option);
                  const totalImages = titleImages + optionsImages + explanationImages;

                  return (
                    <tr key={row.id} className="border-t border-foreground/10 bg-white/5 align-top">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={(event) => toggleRowSelection(row.id, event.target.checked)}
                          aria-label={`Select question ${row.id}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">{row.id}</td>
                      <td className="px-4 py-3">ID {row.topic_id}</td>
                      <td className="px-4 py-3">ID {row.subtopic_id}</td>
                      <td className="px-4 py-3">{row.difficulty}</td>
                      <td className="px-4 py-3">
                        {renderBlocks(row.title)}
                        {titleImages > 0 ? (
                          <p className="mt-1 text-xs text-accent">{titleImages} image block(s)</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        {renderOptions(row.options)}
                        {optionsImages > 0 ? (
                          <p className="mt-1 text-xs text-accent">{optionsImages} image block(s)</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 wrap-break-word">{correctOptionText}</td>
                      <td className="px-4 py-3">{totalImages}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-foreground/15 px-3 py-1 text-xs font-semibold transition hover:border-accent hover:text-accent"
                            onClick={() => onEdit(row)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                            onClick={() => onDelete(row)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-background/30 px-4 py-3 text-sm">
            <p className="text-foreground/70">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-xl border border-foreground/15 px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-xl border border-foreground/15 px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
