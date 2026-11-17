import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faCheck, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";

type Props = {
  name: string;
  onChangeName: (newName: string) => void;
  uncompletedCount: number;
  totalRemainingMinutes: number;
};

const WelcomeMessage = ({
  name,
  onChangeName,
  uncompletedCount,
  totalRemainingMinutes,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "おはようございます"
      : currentHour < 18
        ? "こんにちは"
        : "こんばんは";

  const formatMinutes = (mins: number): string => {
    if (mins === 0) return "0分";
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    if (hours === 0) return `${rem}分`;
    if (rem === 0) return `${hours}時間`;
    return `${hours}時間${rem}分`;
  };

  const handleSaveName = () => {
    const trimmed = draftName.trim();
    if (trimmed.length > 0) {
      onChangeName(trimmed);
    } else {
      setDraftName(name);
    }
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-lg font-bold text-blue-900">
          <span>{greeting}、</span>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                className="w-36 rounded border border-blue-400 bg-white px-2 py-0.5 text-sm font-normal text-slate-800"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="cursor-pointer rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                aria-label="名前を保存"
              >
                <FontAwesomeIcon icon={faCheck} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftName(name);
                setIsEditing(true);
              }}
              className="group flex cursor-pointer items-center gap-1.5 rounded px-1 hover:bg-blue-100"
              title="クリックしてユーザー名を変更"
            >
              <span>{name}さん</span>
              <FontAwesomeIcon
                icon={faPen}
                className="text-xs text-blue-400 opacity-70 group-hover:opacity-100"
              />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700 shadow-xs">
            未完了: <strong className="text-indigo-600">{uncompletedCount}件</strong>
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-medium text-slate-700 shadow-xs">
            <FontAwesomeIcon icon={faHourglassHalf} className="text-amber-500" />
            残り目安: <strong className="text-amber-600">{formatMinutes(totalRemainingMinutes)}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;