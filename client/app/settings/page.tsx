"use client";

import Link from "next/link";
import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { userAPI, authApi } from "@/lib/api";

export default function SettingsPage() {
  const { user, refresh } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [qr, setQr] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [twoFASuccess, setTwoFASuccess] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setProfileLoading(true);

    try {
      await userAPI.updateProfile({ name });
      await refresh();
      setProfileSuccess(true);
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    setPasswordLoading(true);

    try {
      await userAPI.changePassword(oldPassword, newPassword, confirmPassword);
      setPasswordSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setTwoFAError(null);
    setTwoFALoading(true);

    try {
      const data = await authApi.enable2FA();
      setQr(data.qr);
    } catch (err: any) {
      setTwoFAError(err.message || "Failed to enable 2FA");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFAError(null);
    setTwoFALoading(true);

    try {
      await authApi.verify2FASetup(otpCode);
      setTwoFASuccess(true);
      setQr(null);
    } catch (err: any) {
      setTwoFAError(err.message || "Invalid code");
    } finally {
      setTwoFALoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 text-white space-y-8 max-w-lg mx-auto">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Link
            href="/dashboard"
            className="text-green-400 hover:text-green-300 hover:underline text-sm transition"
          >
            ← Dashboard
          </Link>
        </div>

        <Card>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <h2 className="text-lg font-semibold">Profile</h2>

            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              value={user?.email || ""}
              readOnly
              className="bg-gray-800 text-gray-400"
            />

            <Button loading={profileLoading} disabled={profileLoading}>
              Save Changes
            </Button>

            {profileError && (
              <p className="text-red-400 text-sm">{profileError}</p>
            )}

            {profileSuccess && (
              <p className="text-green-400 text-sm">
                Profile updated!
              </p>
            )}
          </form>
        </Card>

        <Card>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <h2 className="text-lg font-semibold">Change Password</h2>

            <Input
              type="password"
              placeholder="Current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button loading={passwordLoading} disabled={passwordLoading}>
              Change Password
            </Button>

            {passwordError && (
              <p className="text-red-400 text-sm">{passwordError}</p>
            )}

            {passwordSuccess && (
              <p className="text-green-400 text-sm">
                Password changed!
              </p>
            )}
          </form>
        </Card>

        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Two-Factor Authentication
            </h2>

            {twoFASuccess && (
              <p className="text-green-400 text-sm">
                2FA enabled successfully!
              </p>
            )}

            {!qr && !twoFASuccess && (
              <Button
                loading={twoFALoading}
                onClick={handleEnable2FA}
              >
                Enable 2FA
              </Button>
            )}

            {qr && (
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Scan this QR code with Google Authenticator or Authy,
                  then enter the code below.
                </p>

                <img
                  src={qr}
                  alt="2FA QR Code"
                  className="w-48 h-48 mx-auto"
                />

                <Input
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                />

                <Button loading={twoFALoading}>
                  Verify & Enable
                </Button>

                {twoFAError && (
                  <p className="text-red-400 text-sm">
                    {twoFAError}
                  </p>
                )}
              </form>
            )}
          </div>
        </Card>

      </div>
    </ProtectedRoute>
  );
}