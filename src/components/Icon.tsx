interface CharProps {
  char: string;
  fgColor?: string;
  bgColor?: string;
}

export const ColorMaps = {
  fg: {
    black: "text-black",
    "#d9d9d9": "text-[#d9d9d9]",
  },
  bg: {
    black: "bg-black",
    "#d9d9d9": "bg-[#d9d9d9]",
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
