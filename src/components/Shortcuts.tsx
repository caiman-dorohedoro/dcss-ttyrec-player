import { useTranslation } from "react-i18next";

const Shortcuts = () => {
  const { t } = useTranslation();

  const shortcuts = [
    { key: "space", description: t("shortcuts.play_pause") },
    { key: "f", description: t("shortcuts.fullscreen") },
    { key: "← / →", description: t("shortcuts.rewind_fast_forward") },
    {
      key: "Shift + ← / →",
      description: t("shortcuts.rewind_fast_forward_10"),
    },
    { key: "[ / ]", description: t("shortcuts.jump_to_previous_next_marker") },
    { key: "0-9", description: t("shortcuts.jump_to_0_10_20_90") },
    {
      key: ", / .",
      description: t("shortcuts.step_back_forward_frame_by_frame"),
    },
    { key: "?", description: t("shortcuts.toggle_help_popup") },
  ];

  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg mx-auto hidden sm:block lg:max-w-[500px] xl:max-w-[896px]">
      <h3 className="font-semibold mb-3">{t("shortcuts.title")}</h3>
      <div className="space-y-2 grid grid-cols-2 gap-2 ">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex text-sm items-start">
            <kbd className="bg-gray-100 px-2 py-0.5 rounded mr-2 min-w-[80px] inline-block">
              {shortcut.key}
            </kbd>
            <span className="text-gray-600 text-start">
              {shortcut.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shortcuts;
