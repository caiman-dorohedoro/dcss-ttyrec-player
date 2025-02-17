interface CharProps {
  char: string;
  fgColor?: string;
  bgColor?: string;
}

export const ColorMaps = {
  fg: {
    black: "text-black",
    "#d9d9d9": "text-[#d9d9d9]",
    "#ddaf3c": "text-[#ddaf3c]",
    "#4ebf22": "text-[#4ebf22]",
    "#26b0d7": "text-[#26b0d7]",
  },
  bg: {
    black: "bg-black",
    "#d9d9d9": "bg-[#d9d9d9]",
    "#ddaf3c": "bg-[#ddaf3c]",
    transparent: "bg-transparent",
  },
};

const Char = ({ char, fgColor, bgColor }: CharProps) => (
  <span className={`mono-char ${fgColor} ${bgColor}`}>{char}</span>
);

type DrawDCSSCharactersProps = {
  chars: CharProps[];
};

const DrawDCSSCharacters = ({ chars }: DrawDCSSCharactersProps) => {
  return (
    <>
      {chars.map((char, index) => {
        if (char.char === " ") {
          return (
            <span key={index} className="mono-char">
              {" "}
            </span>
          );
        }

        return (
          <Char
            key={index}
            char={char.char}
            fgColor={char.fgColor}
            bgColor={char.bgColor}
          />
        );
      })}
    </>
  );
};

export default DrawDCSSCharacters;
