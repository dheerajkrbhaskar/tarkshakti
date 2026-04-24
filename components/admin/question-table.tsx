"use client";

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

function renderOptions(options: unknown) {
  const normalized = normalizeOptionItems(options);

  if (normalized.length === 0) {
    return "-";
  }

  return normalized.map((option) => option.text || option.value).join(" | ");
}

export default function QuestionTable({ rows, loading, onEdit, onDelete }: QuestionTableProps) {
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
    <div className="overflow-x-auto rounded-2xl border border-foreground/10">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-background/60 text-foreground/70">
          <tr>
            <th className="px-4 py-3 font-semibold">ID</th>
            <th className="px-4 py-3 font-semibold">Title</th>
            <th className="px-4 py-3 font-semibold">Options</th>
            <th className="px-4 py-3 font-semibold">Correct Option</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const titleText = contentValueToText(row.title);
            const titleImages = getImageCount(row.title);
            const optionsText = renderOptions(row.options);
            const optionsImages = getImageCount(row.options);

            return (
              <tr key={row.id} className="border-t border-foreground/10 bg-white/5 align-top">
                <td className="px-4 py-3 font-medium">{row.id}</td>
                <td className="px-4 py-3">
                  <p className="max-w-[360px] truncate" title={titleText}>{titleText || "-"}</p>
                  {titleImages > 0 ? (
                    <p className="mt-1 text-xs text-accent">{titleImages} image block(s)</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <p className="max-w-[320px] truncate" title={optionsText}>{optionsText}</p>
                  {optionsImages > 0 ? (
                    <p className="mt-1 text-xs text-accent">{optionsImages} image block(s)</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">{String(row.correct_option ?? "-")}</td>
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
  );
}
