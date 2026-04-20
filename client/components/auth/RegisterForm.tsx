import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterForm() {
  return (
    <Card>
      <h1 className="text-3xl font-bold mb-6 text-white">
        Create Account
      </h1>

      <div className="space-y-4">
        <Input placeholder="Name" />
        <Input placeholder="Email" />
        <Input type="password" placeholder="Password" />

        <Button>Create Account</Button>
      </div>
    </Card>
  );
}