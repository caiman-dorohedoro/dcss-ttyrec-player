import DrawDCSSCharacters, { ColorMaps } from "@/components/Icon";

const logoChars = [
  {
    char: "@",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg["#d9d9d9"],
  },
  {
    char: ".",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg["#d9d9d9"],
  },
  {
    char: ".",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg["#d9d9d9"],
  },
  {
    char: ".",
    fgColor: ColorMaps.fg["#d9d9d9"],
    bgColor: ColorMaps.bg.black,
  },
  {
    char: " ",
  },
];

const titleChars = [
  {
    char: "T",
    fgColor: ColorMaps.fg["#ddaf3c"],
    bgColor: ColorMaps.bg.black,
  },
  {
    char: "†",
    fgColor: ColorMaps.fg["#26b0d7"],
    bgColor: ColorMaps.bg["#ddaf3c"],
  },
  {
    char: "y",
    fgColor: ColorMaps.fg["#4ebf22"],
    bgColor: ColorMaps.bg.black,
  },
  {
    char: "r",
    fgColor: ColorMaps.fg["#d9d9d9"],
    bgColor: ColorMaps.bg.black,
  },
  {
    char: "e",
    fgColor: ColorMaps.fg["#4ebf22"],
    bgColor: ColorMaps.bg.black,
  },
  {
    char: "c",
    fgColor: ColorMaps.fg["#26b0d7"],
    bgColor: ColorMaps.bg.black,
  },
  {
    char: " ",
  },
  {
    char: "P",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg.transparent,
  },
  {
    char: "l",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg.transparent,
  },
  {
    char: "a",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg.transparent,
  },
  {
    char: "y",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg.transparent,
  },
  {
    char: "e",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg.transparent,
  },
  {
    char: "r",
    fgColor: ColorMaps.fg.black,
    bgColor: ColorMaps.bg.transparent,
  },
];

const Title = () => {
  return (
    <>
      <DrawDCSSCharacters chars={logoChars} />
      <DrawDCSSCharacters chars={titleChars} />
    </>
  );
};

export default Title;
