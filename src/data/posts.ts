import { categories, getCategory } from "./categories";

export function postCategory(id: string) {
  const key = getCategory(id);
  const label = categories.find((category) => category.key === key)?.label ?? "기타";
  return { key, label };
}

export const displayDate = (date: Date) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(date);
