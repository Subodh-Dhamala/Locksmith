import { FaGithub, FaLock, FaGoogle } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginForm() {
  return (
    <Card>
      <div className="text-center mb-8">
        <h2 className="text-3xl text-white mb-2 font-bold">
          Welcome Back!
        </h2>
      </div>

      <div className="space-y-6">
 
        <div>
          <label className="text-xs text-gray-400 mb-2 block">
            Email
          </label>
          <div className="relative">
            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input type="email" placeholder="name@domain.com" />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-2 block">
            Password
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input type="password" placeholder="••••••••" />
          </div>
        </div>

        <Button>Login</Button>

      
        <div className="text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <span className="text-green-400 cursor-pointer hover:underline">
            Register here
          </span>
        </div>

        
        <div className="mt-6 space-y-3">

          <button
            type="button"
            className="w-full border border-gray-600 p-3 rounded text-white flex items-center justify-center gap-2 hover:bg-gray-800 transition"
          >
            <FaGoogle />
            Continue with Google
          </button>

          <button
            type="button"
            className="w-full border border-gray-600 p-3 rounded text-white flex items-center justify-center gap-2 hover:bg-gray-800 transition"
          >
            <FaGithub />
            Continue with GitHub
          </button>

        </div>

      </div>
    </Card>
  );
}