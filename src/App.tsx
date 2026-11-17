import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import type { Todo, Category } from "./types";
import { initTodos } from "./initTodos";
import WelcomeMessage from "./WelcomeMessage";
import TodoList from "./TodoList";
import { v4 as uuid } from "uuid";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faMagnifyingGlass,
  faArrowDownWideShort,
} from "@fortawesome/free-solid-svg-icons";

const localStorageKey = "TodoApp_v2";
const userNameStorageKey = "TodoApp_userName";

type StoredTodo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: string | null;
  category?: Category;
  estimatedMinutes?: number;
};

type FilterStatus = "ALL" | "ACTIVE" | "COMPLETED";
type SortOption = "CREATED" | "DEADLINE" | "PRIORITY";

const categories: Category[] = ["課題・レポート", "開発・研究", "バイト・私用"];

const loadTodos = (): Todo[] => {
  const todoJsonStr = localStorage.getItem(localStorageKey);
  if (todoJsonStr === null) {
    return initTodos;
  }

  const storedTodos: StoredTodo[] = JSON.parse(todoJsonStr);
  return storedTodos.map((todo) => ({
    ...todo,
    deadline: todo.deadline === null ? null : new Date(todo.deadline),
    category: todo.category ?? "課題・レポート",
    estimatedMinutes: todo.estimatedMinutes ?? 30,
  }));
};

const getTodoNameError = (name: string): string => {
  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 32) {
    return "前後の空白を除いて、2文字以上、32文字以内で入力してください";
  }
  return "";
};

const App = () => {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [userName, setUserName] = useState<string>(
    () => localStorage.getItem(userNameStorageKey) ?? "寝屋川タヌキ"
  );

  // 新規タスク入力用 State
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState(2);
  const [newTodoDeadline, setNewTodoDeadline] = useState<Date | null>(null);
  const [newTodoCategory, setNewTodoCategory] = useState<Category>("課題・レポート");
  const [newTodoMinutes, setNewTodoMinutes] = useState<number>(30);
  const [isNameTouched, setIsNameTouched] = useState(false);

  // 絞り込み・並び替え用 State
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [filterCategory, setFilterCategory] = useState<Category | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("CREATED");

  // 集計値（派生状態）
  const uncompletedTodos = todos.filter((todo) => !todo.isDone);
  const uncompletedCount = uncompletedTodos.length;
  const completedCount = todos.length - uncompletedCount;
  const totalRemainingMinutes = uncompletedTodos.reduce(
    (sum, todo) => sum + todo.estimatedMinutes,
    0
  );

  const newTodoNameError = getTodoNameError(newTodoName);
  const isNewTodoNameInvalid = newTodoNameError !== "";
  const showNewTodoNameError = isNameTouched && isNewTodoNameInvalid;

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(userNameStorageKey, userName);
  }, [userName]);

  // 表示用タスクリストのフィルタリングとソート
  const filteredAndSortedTodos = todos
    .filter((todo) => {
      if (filterStatus === "ACTIVE" && todo.isDone) return false;
      if (filterStatus === "COMPLETED" && !todo.isDone) return false;
      if (filterCategory !== "ALL" && todo.category !== filterCategory) return false;
      if (
        searchQuery.trim() !== "" &&
        !todo.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "PRIORITY") {
        return a.priority - b.priority; // 1(高) -> 3(低)
      }
      if (sortBy === "DEADLINE") {
        // 期限未設定は後ろへ回す
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.getTime() - b.deadline.getTime();
      }
      return 0; // 登録順
    });

  const updateNewTodoName = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTodoName(e.target.value);
    setIsNameTouched(true);
  };

  const updateDeadline = (e: ChangeEvent<HTMLInputElement>) => {
    const dt = e.target.value;
    setNewTodoDeadline(dt === "" ? null : new Date(dt));
  };

  const addNewTodo = () => {
    if (isNewTodoNameInvalid) {
      setIsNameTouched(true);
      return;
    }

    const newTodo: Todo = {
      id: uuid(),
      name: newTodoName.trim(),
      isDone: false,
      priority: newTodoPriority,
      deadline: newTodoDeadline,
      category: newTodoCategory,
      estimatedMinutes: newTodoMinutes,
    };
    setTodos((currentTodos) => [...currentTodos, newTodo]);
    setNewTodoName("");
    setNewTodoPriority(2);
    setNewTodoDeadline(null);
    setNewTodoCategory("課題・レポート");
    setNewTodoMinutes(30);
    setIsNameTouched(false);
  };

  const updateIsDone = (id: string, value: boolean) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, isDone: value } : todo
      )
    );
  };

  const removeCompletedTodos = () => {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.isDone));
  };

  const remove = (id: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
          TaskPulse <span className="text-sm font-normal text-slate-500">- 締切＆工数管理</span>
        </h1>
      </header>

      <div className="mb-5">
        <WelcomeMessage
          name={userName}
          onChangeName={setUserName}
          uncompletedCount={uncompletedCount}
          totalRemainingMinutes={totalRemainingMinutes}
        />
      </div>

      {/* コントロールバー：絞り込み・検索・並び替え */}
      <div className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* 状態タブ */}
          <div className="flex rounded-md bg-slate-200/70 p-0.5 text-xs font-bold">
            {(
              [
                { key: "ALL", label: `すべて (${todos.length})` },
                { key: "ACTIVE", label: `未完了 (${uncompletedCount})` },
                { key: "COMPLETED", label: `完了済み (${completedCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key)}
                className={twMerge(
                  "cursor-pointer rounded px-2.5 py-1 transition-colors",
                  filterStatus === tab.key
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 並び替えセレクト */}
          <div className="flex items-center gap-1.5 text-xs">
            <FontAwesomeIcon icon={faArrowDownWideShort} className="text-slate-500" />
            <select
              aria-label="並び替え"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded border border-slate-300 bg-white px-2 py-1 font-medium text-slate-700"
            >
              <option value="CREATED">登録順</option>
              <option value="DEADLINE">期限が近い順</option>
              <option value="PRIORITY">優先度が高い順</option>
            </select>
          </div>
        </div>

        {/* カテゴリ絞り込み & キーワード検索 */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            aria-label="カテゴリで絞り込み"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as Category | "ALL")}
            className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
          >
            <option value="ALL">全カテゴリ</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="タスク名で検索..."
              className="w-full rounded border border-slate-300 bg-white py-1.5 pr-3 pl-7 text-xs text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* タスク一覧 */}
      <TodoList
        todos={filteredAndSortedTodos}
        updateIsDone={updateIsDone}
        remove={remove}
      />

      {/* 一括削除ボタン */}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={removeCompletedTodos}
          disabled={completedCount === 0}
          className={twMerge(
            "cursor-pointer rounded-md px-3 py-1.5 text-xs font-bold",
            "bg-rose-500 text-white hover:bg-rose-600",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-rose-500"
          )}
        >
          完了済みのタスクを一括削除 ({completedCount})
        </button>
      </div>

      {/* 新規タスク追加フォーム */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addNewTodo();
        }}
        aria-labelledby="newTodoHeading"
        className="mt-6 space-y-3 rounded-lg border border-slate-300 bg-white p-4 shadow-sm"
      >
        <h2 id="newTodoHeading" className="text-base font-bold text-slate-800">
          新しいタスクの追加
        </h2>

        {/* タスク名 */}
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700" htmlFor="newTodoName">
            タスク名（必須）
          </label>
          <input
            id="newTodoName"
            name="todoName"
            type="text"
            required
            value={newTodoName}
            onChange={updateNewTodoName}
            aria-invalid={showNewTodoNameError}
            aria-describedby={showNewTodoNameError ? "newTodoNameError" : undefined}
            className={twMerge(
              "w-full rounded-md border border-slate-300 p-2 text-sm",
              showNewTodoNameError && "border-red-500 outline-red-500"
            )}
            placeholder="例: 物理実験のレポート提出（2〜32文字）"
          />
          {showNewTodoNameError && (
            <div
              id="newTodoNameError"
              aria-live="polite"
              className="mt-1 flex items-center space-x-1 text-xs font-medium text-red-500"
            >
              <FontAwesomeIcon icon={faTriangleExclamation} className="mr-0.5" />
              <div>{newTodoNameError}</div>
            </div>
          )}
        </div>

        {/* カテゴリ & 見積もり時間（スマホでは縦並び、PCでは横並び） */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700" htmlFor="newTodoCategory">
              カテゴリ
            </label>
            <select
              id="newTodoCategory"
              value={newTodoCategory}
              onChange={(e) => setNewTodoCategory(e.target.value as Category)}
              className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700" htmlFor="newTodoMinutes">
              予想作業時間
            </label>
            <select
              id="newTodoMinutes"
              value={newTodoMinutes}
              onChange={(e) => setNewTodoMinutes(Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
            >
              <option value={15}>15分</option>
              <option value={30}>30分</option>
              <option value={45}>45分</option>
              <option value={60}>1時間 (60分)</option>
              <option value={90}>1時間30分 (90分)</option>
              <option value={120}>2時間 (120分)</option>
              <option value={180}>3時間 (180分)</option>
            </select>
          </div>
        </div>

        {/* 優先度 & 期限 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <fieldset>
            <legend className="mb-1 text-xs font-bold text-slate-700">優先度（1が最高）</legend>
            <div className="flex gap-4 pt-1">
              {[1, 2, 3].map((value) => (
                <label key={value} className="flex cursor-pointer items-center space-x-1 text-sm">
                  <input
                    id={`priority-${value}`}
                    name="priorityGroup"
                    type="radio"
                    value={value}
                    checked={newTodoPriority === value}
                    onChange={(e) => setNewTodoPriority(Number(e.target.value))}
                  />
                  <span>
                    {value} ({"★".repeat(4 - value)})
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700" htmlFor="deadline">
              期限（任意）
            </label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={
                newTodoDeadline
                  ? dayjs(newTodoDeadline).format("YYYY-MM-DDTHH:mm")
                  : ""
              }
              onChange={updateDeadline}
              className="w-full rounded-md border border-slate-300 p-1.5 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isNewTodoNameInvalid}
          className={twMerge(
            "w-full cursor-pointer rounded-md py-2 text-sm font-bold text-white sm:w-auto sm:px-6",
            "bg-indigo-600 hover:bg-indigo-700",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-indigo-600"
          )}
        >
          タスクを追加する
        </button>
      </form>
    </div>
  );
};

export default App;