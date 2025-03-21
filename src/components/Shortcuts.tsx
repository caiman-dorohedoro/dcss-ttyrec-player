const shortcuts = [
  // { key: "space", description: "pause / resume" },
  { key: "space", description: "플레이 / 정지" },
  // { key: "f", description: "toggle fullscreen mode" },
  { key: "f", description: "전체 화면 모드 전환" },
  // { key: "← / →", description: "rewind / fast-forward by 5 seconds" },
  { key: "← / →", description: "5초 뒤로 / 5초 앞으로" },
  // { key: "Shift + ← / →", description: "rewind / fast-forward by 10%" },
  { key: "Shift + ← / →", description: "10% 뒤로 / 10% 앞으로" },
  // { key: "[ / ]", description: "jump to the previous / next marker" },
  { key: "[ / ]", description: "이전 / 다음 마크로 이동" },
  // { key: "0-9", description: "jump to 0%, 10%, 20% ... 90%" },
  { key: "0-9", description: "0%, 10%, 20% ... 90%로 이동" },
  // { key: ", / .", description: "step back / forward, frame by frame (when paused)" },
  {
    key: ", / .",
    description: "(일시정지 상태에서) 프레임 단위로 뒤로 / 앞으로",
  },
  // { key: "?", description: "toggle this help popup" },
  { key: "?", description: "도움말 표시 / 숨김" },
];

const Shortcuts = () => {
  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg mx-auto hidden sm:block lg:max-w-[500px] xl:max-w-[896px]">
      <h3 className="font-semibold mb-3">키보드 단축키</h3>
      <div className="space-y-2 grid grid-cols-2 gap-2 ">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex text-sm">
            <kbd className="bg-gray-100 px-2 py-0.5 rounded mr-2 min-w-[80px] inline-block">
              {shortcut.key}
            </kbd>
            <span className="text-gray-600">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shortcuts;
