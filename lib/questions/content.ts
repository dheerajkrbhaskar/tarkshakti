export type QuestionContentBlock = {
    type: string;
    value: string;
};

export type QuizOptionItem = {
    value: string;
    text: string;
    blocks: QuestionContentBlock[];
};

function tryParseJson(raw: unknown): unknown {
    if (typeof raw !== "string") return raw;

    const trimmed = raw.trim();
    if (!trimmed) return raw;

    try {
        return JSON.parse(trimmed);
    } catch {
        return raw;
    }
}

function normalizeRawString(raw: unknown): string {
    if (typeof raw !== "string") return "";
    return raw.trim();
}

function canonicalJsonValue(raw: unknown): string {
    const parsed = tryParseJson(raw);

    if (typeof parsed === "string") return parsed.trim();

    try {
        return JSON.stringify(parsed);
    } catch {
        return "";
    }
}

function normalizeSingleBlock(raw: unknown): QuestionContentBlock | null {
    if (!raw || typeof raw !== "object") return null;

    const maybeBlock = raw as { type?: unknown; value?: unknown };
    if (typeof maybeBlock.value !== "string") return null;

    const type = typeof maybeBlock.type === "string" ? maybeBlock.type : "text";
    return {
        type,
        value: maybeBlock.value,
    };
}

export function normalizeContentBlocks(raw: unknown): QuestionContentBlock[] {
    const parsed = tryParseJson(raw);

    if (typeof parsed === "string") {
        const text = parsed.trim();
        return text ? [{ type: "text", value: text }] : [];
    }

    if (!Array.isArray(parsed)) {
        const single = normalizeSingleBlock(parsed);
        return single ? [single] : [];
    }

    const blocks: QuestionContentBlock[] = [];

    for (const item of parsed) {
        if (Array.isArray(item)) {
            blocks.push(...normalizeContentBlocks(item));
            continue;
        }

        const block = normalizeSingleBlock(item);
        if (block) blocks.push(block);
    }

    return blocks;
}

export function contentBlocksToText(blocks: QuestionContentBlock[]): string {
    return blocks
        .filter((block) => block.type === "text")
        .map((block) => block.value.trim())
        .filter(Boolean)
        .join(" ");
}

export function contentValueToText(raw: unknown): string {
    const blocks = normalizeContentBlocks(raw);
    if (blocks.length > 0) {
        return contentBlocksToText(blocks);
    }

    return typeof raw === "string" ? raw : "";
}

export function normalizeOptionItems(raw: unknown): QuizOptionItem[] {
    const parsed = tryParseJson(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
        .map((optionRaw) => {
            const blocks = normalizeContentBlocks(optionRaw);
            const text = contentBlocksToText(blocks);
            const parsedOption = tryParseJson(optionRaw);

            const value =
                typeof parsedOption === "string"
                    ? parsedOption
                    : JSON.stringify(parsedOption);

            return {
                // Keep a stable serialized payload so selected_option can be matched against correct_option later.
                value,
                text,
                blocks,
            };
        })
        .filter((item) => item.blocks.length > 0 || item.text.length > 0);
}

export function isEquivalentOptionValue(left: unknown, right: unknown): boolean {
    if (left == null || right == null) return false;

    const leftCanonical = canonicalJsonValue(left);
    const rightCanonical = canonicalJsonValue(right);

    if (leftCanonical && rightCanonical && leftCanonical === rightCanonical) {
        return true;
    }

    const leftText = contentValueToText(left).trim();
    const rightText = contentValueToText(right).trim();
    if (leftText && rightText && leftText === rightText) {
        return true;
    }

    const leftRaw = normalizeRawString(left);
    const rightRaw = normalizeRawString(right);

    return Boolean(leftRaw && rightRaw && leftRaw === rightRaw);
}
