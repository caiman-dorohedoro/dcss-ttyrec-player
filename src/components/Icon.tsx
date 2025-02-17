interface CharProps {
  char: string;
  isDark?: boolean;
}

const Char = ({ char, isDark = false }: CharProps) => (
  <span
    className={`mono-char ${
      isDark ? "text-[#d9d9d9] bg-black" : "fg-black bg-[#d9d9d9]"
    }`}
  >
    {char}
  </span>
);

const Icon = () => {
  const chars = ["@", ".", ".", ".", " "];

  return (
    <h1 className="xl:text-2xl text-lg font-bold text-center">
      {chars.map((char, index) => (
        <Char key={index} char={char} isDark={index === 3} />
      ))}
    </h1>
  );
};

export default Icon;
