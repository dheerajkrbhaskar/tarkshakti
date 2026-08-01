"use client";

import { useEffect, useState } from "react";
import type { Subtopic, Topic } from "@/lib/models/topic.model";

type FilterPanelProps = {
	topics: Topic[];
	selectedTopicId?: number;
	selectedSubtopicId?: number;
	onApply: (filters: { topic_id?: number; subtopic_id?: number }) => void;
};

export default function FilterPanel({
	topics,
	selectedTopicId,
	selectedSubtopicId,
	onApply,
}: FilterPanelProps) {
	const [topicId, setTopicId] = useState<number | undefined>(selectedTopicId);
	const [subtopicId, setSubtopicId] = useState<number | undefined>(selectedSubtopicId);
	const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
	const [loadingSubtopics, setLoadingSubtopics] = useState(false);

	useEffect(() => {
		setTopicId(selectedTopicId);
	}, [selectedTopicId]);

	useEffect(() => {
		setSubtopicId(selectedSubtopicId);
	}, [selectedSubtopicId]);

	useEffect(() => {
		async function loadSubtopics() {
			if (!topicId) {
				setSubtopics([]);
				setSubtopicId(undefined);
				return;
			}

			setLoadingSubtopics(true);
			try {
				const response = await fetch(`/api/admin/subtopics?topic_id=${topicId}`);
				const payload = await response.json();

				if (!response.ok || !payload.success) {
					throw new Error(payload.error || "Failed to fetch subtopics");
				}

				setSubtopics(Array.isArray(payload.data) ? payload.data : []);
			} catch (error) {
				console.error(error);
				setSubtopics([]);
			} finally {
				setLoadingSubtopics(false);
			}
		}

		void loadSubtopics();
	}, [topicId]);

	return (
		<section className="rounded-2xl border border-foreground/10 bg-white/5 p-4 shadow-sm">
			<h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Filters</h2>

			<div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
				<label className="flex flex-col gap-1 text-sm">
					<span className="text-foreground/70">Topic</span>
					<select
						className="rounded-xl border border-foreground/15 bg-background/60 px-3 py-2 text-sm"
						value={topicId ?? ""}
						onChange={(event) => {
							const next = event.target.value ? Number(event.target.value) : undefined;
							setTopicId(next);
							setSubtopicId(undefined);
						}}
					>
						<option value="">All topics</option>
						{topics.map((topic) => (
							<option key={topic.id} value={topic.id}>
								{topic.name}
							</option>
						))}
					</select>
				</label>

				<label className="flex flex-col gap-1 text-sm">
					<span className="text-foreground/70">Subtopic</span>
					<select
						className="rounded-xl border border-foreground/15 bg-background/60 px-3 py-2 text-sm"
						value={subtopicId ?? ""}
						disabled={!topicId || loadingSubtopics}
						onChange={(event) => {
							setSubtopicId(event.target.value ? Number(event.target.value) : undefined);
						}}
					>
						<option value="">All subtopics</option>
						{loadingSubtopics ? <option value="" disabled>Loading subtopics...</option> : null}
						{subtopics.map((subtopic) => (
							<option key={subtopic.id} value={subtopic.id}>
								{subtopic.name}
							</option>
						))}
					</select>
				</label>

				<div className="flex items-end">
					<button
						type="button"
						className="w-full rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
						onClick={() => onApply({ topic_id: topicId, subtopic_id: subtopicId })}
					>
						Fetch Data
					</button>
				</div>
			</div>
		</section>
	);
}
