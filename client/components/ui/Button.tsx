type ButtonProps = {
  children: React.ReactNode;
};

export default function Button({ children }: ButtonProps) {
  return (
    <button className="w-full bg-blue-400 hover:bg-blue-500 transition text-black p-3 rounded font-semibold">
      {children}
    </button>
  );
}