export type Question = {
  id: number;
  title: any;
  options: any;
  correct_option: any;
  explanation: any;
  difficulty: number;
  topic_id: number;
  subtopic_id: number;
};

export type QuestionFilter = {
  topic_id?: number;
  subtopic_id?: number;
  limit?: number;
  offset?: number;
};

export type QuestionWriteInput = {
  title: any;
  options: any;
  correct_option: any;
  explanation?: any;
  difficulty?: number;
  topic_id: number;
  subtopic_id: number;
};

export function parseJsonInput(value: unknown): any {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

export function replaceFirstImageUrl(payload: any, newUrl: string): any {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

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
      nextNode.value = newUrl;
      replaced = true;
      return nextNode;
    }

    for (const key of Object.keys(nextNode)) {
      nextNode[key] = walk(nextNode[key]);
    }

    return nextNode;
  };

  return walk(payload);
}
