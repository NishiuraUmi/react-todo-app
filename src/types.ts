export type Category = "課題・レポート" | "開発・研究" | "バイト・私用";

export type Todo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: Date | null;
  category: Category;
  estimatedMinutes: number;
};