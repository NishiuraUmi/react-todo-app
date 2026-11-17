import type { Todo } from "./types";
import { v4 as uuid } from "uuid";

export const initTodos: Todo[] = [
  {
    id: uuid(),
    name: "プログラミング演習のレポート作成",
    isDone: false,
    priority: 1,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 18), // 18時間後（期限間近の例）
    category: "課題・レポート",
    estimatedMinutes: 90,
  },
  {
    id: uuid(),
    name: "オリジナルTodoアプリのUI調整",
    isDone: false,
    priority: 2,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 72), // 3日後
    category: "開発・研究",
    estimatedMinutes: 120,
  },
  {
    id: uuid(),
    name: "アルバイトのシフト希望提出",
    isDone: true,
    priority: 3,
    deadline: null,
    category: "バイト・私用",
    estimatedMinutes: 15,
  },
];