import type { Study } from "../graphics/studies";
import { categories, getCategory } from "./categories";

const topics: Record<string, Study> = {
  swift: "pulse",
  ios: "strata",
  "math-cs": "network",
  tools: "knot",
  unicode: "glyph",
  etc: "type",
};

export function postPlate(id: string) {
  const topic = getCategory(id);
  return {
    kind:
      id === "karpathy-microgpt-atomic-gpt"
        ? ("network" as const)
        : topics[topic],
    label:
      categories.find((category) => category.key === topic)?.label ?? "기타",
  };
}

export const displayDate = (date: Date) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(date);
