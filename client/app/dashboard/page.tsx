import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  return (

  <ProtectedRoute>
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-400 mt-2">
        Coming Soon!
      </p>
    </div>
  </ProtectedRoute>
  );
}