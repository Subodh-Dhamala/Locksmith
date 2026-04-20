export default function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full p-3 pl-10 bg-[#060e20] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
    />
  );
}