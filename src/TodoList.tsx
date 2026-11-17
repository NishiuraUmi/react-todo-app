import type { Todo, Category } from "./types";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faTrash,
  faHourglassEnd,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

type Props = {
  todos: Todo[];
  updateIsDone: (id: string, value: boolean) => void;
  remove: (id: string) => void;
};

const num2star = (n: number): string => "★".repeat(4 - n);

// カテゴリごとのバッジ配色
const categoryBadgeStyle: Record<Category, string> = {
  "課題・レポート": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "開発・研究": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "バイト・私用": "bg-amber-100 text-amber-700 border-amber-200",
};

// 期限までの残り時間を計算してステータスを返す関数
const getDeadlineStatus = (deadline: Date | null, isDone: boolean) => {
  if (!deadline || isDone) return null;

  const now = dayjs();
  const target = dayjs(deadline);
  const diffMinutes = target.diff(now, "minute");

  if (diffMinutes < 0) {
    return {
      label: "期限切れ",
      badgeClass: "bg-red-600 text-white",
      cardBorderClass: "border-red-400 bg-red-50/30",
    };
  }
  if (diffMinutes <= 24 * 60) {
    const hours = Math.floor(diffMinutes / 60);
    const label = hours >= 1 ? `あと約${hours}時間` : `あと${diffMinutes}分`;
    return {
      label,
      badgeClass: "bg-amber-500 text-white",
      cardBorderClass: "border-amber-400 bg-amber-50/20",
    };
  }
  const days = target.diff(now, "day");
  return {
    label: `あと${days}日`,
    badgeClass: "bg-slate-200 text-slate-700",
    cardBorderClass: "border-slate-300 bg-white",
  };
};

const TodoList = ({ todos, updateIsDone, remove }: Props) => {
  if (todos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-8 text-center text-slate-500">
        条件に一致するタスクはありません。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {todos.map((todo) => {
        const status = getDeadlineStatus(todo.deadline, todo.isDone);

        return (
          <div
            key={todo.id}
            className={twMerge(
              "rounded-lg border border-slate-300 bg-white px-4 py-3 shadow-xs transition-all",
              status?.cardBorderClass,
              todo.isDone && "border-slate-200 bg-slate-50 opacity-65"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              {/* 左側：チェックボックスとタスク内容 */}
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <input
                  type="checkbox"
                  checked={todo.isDone}
                  onChange={(e) => updateIsDone(todo.id, e.target.checked)}
                  aria-label={`${todo.name}を完了にする`}
                  className="mt-1 h-5 w-5 cursor-pointer rounded border-slate-300 accent-indigo-600"
                />

                <div className="min-w-0 flex-1">
                  {/* 上段バッジ群：カテゴリ・優先度・見積もり時間 */}
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={twMerge(
                        "inline-flex items-center gap-1 rounded border px-2 py-0.5 font-medium",
                        categoryBadgeStyle[todo.category]
                      )}
                    >
                      <FontAwesomeIcon icon={faTag} className="text-[10px]" />
                      {todo.category}
                    </span>

                    <span className="font-bold text-orange-500" title={`優先度 ${todo.priority}`}>
                      {num2star(todo.priority)}
                    </span>

                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <FontAwesomeIcon icon={faHourglassEnd} className="text-[10px]" />
                      目安 {todo.estimatedMinutes}分
                    </span>
                  </div>

                  {/* タスク名 */}
                  <div
                    className={twMerge(
                      "break-words text-base font-bold text-slate-800 sm:text-lg",
                      todo.isDone && "text-slate-500 line-through decoration-2"
                    )}
                  >
                    {todo.name}
                  </div>

                  {/* 期限と残り時間バッジ */}
                  {todo.deadline && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                      <span
                        className={twMerge(
                          "flex items-center text-slate-600",
                          todo.isDone && "line-through"
                        )}
                      >
                        <FontAwesomeIcon icon={faClock} className="mr-1.5 text-slate-400" />
                        {dayjs(todo.deadline).format("YYYY/MM/DD HH:mm")}
                      </span>

                      {status && (
                        <span
                          className={twMerge(
                            "rounded-full px-2 py-0.5 text-xs font-bold",
                            status.badgeClass
                          )}
                        >
                          {status.label}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 右側：個別削除ボタン */}
              <button
                type="button"
                onClick={() => remove(todo.id)}
                aria-label={`${todo.name}を削除`}
                title="このタスクを削除"
                className="cursor-pointer rounded-md p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TodoList;