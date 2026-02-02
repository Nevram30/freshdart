"use client";

import { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Palette,
  Save,
  RefreshCw,
} from "lucide-react";

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: typeof Settings;
}

const settingSections: SettingSection[] = [
  {
    id: "general",
    title: "General Settings",
    description: "Configure general application settings",
    icon: Settings,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Manage notification preferences",
    icon: Bell,
  },
  {
    id: "security",
    title: "Security",
    description: "Security and authentication settings",
    icon: Shield,
  },
  {
    id: "email",
    title: "Email Settings",
    description: "Configure email templates and SMTP",
    icon: Mail,
  },
];

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  // General settings state
  const [siteName, setSiteName] = useState("Katig Seafood Marketplace");
  const [siteDescription, setSiteDescription] = useState(
    "Connecting sustainable seafood producers with MSMEs and consumers"
  );
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [verificationNotifications, setVerificationNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Security settings state
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate saving
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-600">Manage application settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {settingSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? "bg-teal-50 text-teal-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      activeSection === section.id ? "text-teal-600" : "text-gray-400"
                    }`}
                  />
                  {section.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white">
            {/* General Settings */}
            {activeSection === "general" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Configure basic application settings
                </p>

                <div className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Site Description
                    </label>
                    <textarea
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">Maintenance Mode</p>
                      <p className="text-sm text-gray-500">
                        When enabled, only admins can access the site
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === "notifications" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Notification Settings
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Manage how notifications are sent
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">
                        Send notifications via email
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">Order Notifications</p>
                      <p className="text-sm text-gray-500">
                        Notify admins of new orders
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={orderNotifications}
                        onChange={(e) => setOrderNotifications(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        Verification Notifications
                      </p>
                      <p className="text-sm text-gray-500">
                        Notify admins of new producer verification requests
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={verificationNotifications}
                        onChange={(e) => setVerificationNotifications(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">Marketing Emails</p>
                      <p className="text-sm text-gray-500">
                        Allow sending marketing emails to users
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={marketingEmails}
                        onChange={(e) => setMarketingEmails(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === "security" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Configure security and authentication
                </p>

                <div className="mt-6 space-y-6">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        Require Email Verification
                      </p>
                      <p className="text-sm text-gray-500">
                        Users must verify their email before accessing the platform
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={requireEmailVerification}
                        onChange={(e) => setRequireEmailVerification(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-gray-500">
                        Require 2FA for admin accounts
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={twoFactorAuth}
                        onChange={(e) => setTwoFactorAuth(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Session Timeout (minutes)
                    </label>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="480">8 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeSection === "email" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">Email Settings</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Configure email delivery settings
                </p>

                <div className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      placeholder="smtp.example.com"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        SMTP Port
                      </label>
                      <input
                        type="text"
                        placeholder="587"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Encryption
                      </label>
                      <select className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500">
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      placeholder="your-email@example.com"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      From Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="noreply@katig.com"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      From Name
                    </label>
                    <input
                      type="text"
                      placeholder="Katig Marketplace"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Mail className="h-4 w-4" />
                    Send Test Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
