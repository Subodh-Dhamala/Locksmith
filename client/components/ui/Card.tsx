export default function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#171f33] p-6 rounded-md shadow-lg border border-gray-700">
      {children}
    </div>
  );
}