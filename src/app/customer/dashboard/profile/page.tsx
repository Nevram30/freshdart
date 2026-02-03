"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Edit2,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function CustomerProfilePage() {
  const utils = api.useUtils();
  const { data: profile, isLoading } = api.profile.getProfile.useQuery();

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);

  const [personalForm, setPersonalForm] = useState({
    name: "",
    phone: "",
  });

  const updatePersonalInfo = api.profile.updatePersonalInfo.useMutation({
    onSuccess: () => {
      void utils.profile.getProfile.invalidate();
      setIsEditingPersonal(false);
    },
  });

  const handleEditPersonal = () => {
    if (profile) {
      setPersonalForm({
        name: profile.name ?? "",
        phone: profile.phone ?? "",
      });
      setIsEditingPersonal(true);
    }
  };

  const handleSavePersonal = () => {
    updatePersonalInfo.mutate({
      name: personalForm.name,
      phone: personalForm.phone || null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-gray-600">
          Manage your personal information
        </p>
      </div>

      {/* Personal Information */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Personal Information</h2>
          </div>
          {!isEditingPersonal && (
            <button
              onClick={handleEditPersonal}
              className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>
        <div className="p-6">
          {isEditingPersonal ? (
            <div className="space-y-4">
              <Input
                label="Full Name"
                id="name"
                value={personalForm.name}
                onChange={(e) =>
                  setPersonalForm({ ...personalForm, name: e.target.value })
                }
                placeholder="Enter your full name"
              />
              <Input
                label="Phone Number"
                id="phone"
                value={personalForm.phone}
                onChange={(e) =>
                  setPersonalForm({ ...personalForm, phone: e.target.value })
                }
                placeholder="Enter your phone number"
              />
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSavePersonal}
                  isLoading={updatePersonalInfo.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingPersonal(false)}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {profile.name ?? "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium text-gray-900">
                    {profile.email ?? "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Phone className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium text-gray-900">
                    {profile.phone ?? "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          Member since{" "}
          <span className="font-medium text-gray-700">
            {new Date(profile.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </p>
      </div>
    </div>
  );
}
