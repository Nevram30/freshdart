"use client";

import { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  ShoppingCart,
  Eye,
  Mail,
  Truck,
  Package,
  Lock,
  Trash2,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { Button } from "~/components/ui/button";

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: typeof Settings;
}

const settingSections: SettingSection[] = [
  {
    id: "notifications",
    title: "Notifications",
    description: "Manage your notification preferences",
    icon: Bell,
  },
  {
    id: "ordering",
    title: "Ordering Preferences",
    description: "Configure default ordering settings",
    icon: ShoppingCart,
  },
  {
    id: "privacy",
    title: "Privacy",
    description: "Control your visibility and data",
    icon: Eye,
  },
  {
    id: "security",
    title: "Security",
    description: "Password and account security",
    icon: Shield,
  },
];

export default function MerchantSettingsPage() {
  const [activeSection, setActiveSection] = useState("notifications");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderStatusNotifications, setOrderStatusNotifications] = useState(true);
  const [deliveryNotifications, setDeliveryNotifications] = useState(true);
  const [sourcingAlerts, setSourcingAlerts] = useState(true);
  const [priceChangeAlerts, setPriceChangeAlerts] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Ordering preferences
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState("COD");
  const [autoReorder, setAutoReorder] = useState(false);
  const [minOrderThreshold, setMinOrderThreshold] = useState("");
  const [preferredCarrier, setPreferredCarrier] = useState("JT_EXPRESS");
  const [defaultCurrency, setDefaultCurrency] = useState("PHP");

  // Privacy settings
  const [publicProfile, setPublicProfile] = useState(true);
  const [showBusinessPhone, setShowBusinessPhone] = useState(true);
  const [showBusinessEmail, setShowBusinessEmail] = useState(true);
  const [allowProducerMessages, setAllowProducerMessages] = useState(true);

  // Security settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-600">
            Manage your account and ordering preferences
          </p>
        </div>
        {activeSection !== "security" && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-green-800">
          <CheckCircle className="h-5 w-5" />
          <span>Settings saved successfully!</span>
        </div>
      )}

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
                  <div>
                    <p>{section.title}</p>
                    <p className="text-xs font-normal text-gray-500">
                      {section.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white">
            {/* Notification Settings */}
            {activeSection === "notifications" && (
              <div className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                    <Bell className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Notification Settings
                    </h2>
                    <p className="text-sm text-gray-600">
                      Choose how you want to be notified
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">
                          Receive notifications via email
                        </p>
                      </div>
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
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Order Status Updates</p>
                        <p className="text-sm text-gray-500">
                          Get notified when your order status changes
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={orderStatusNotifications}
                        onChange={(e) => setOrderStatusNotifications(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Delivery Updates</p>
                        <p className="text-sm text-gray-500">
                          Track delivery and shipment status changes
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={deliveryNotifications}
                        onChange={(e) => setDeliveryNotifications(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Sourcing Alerts</p>
                        <p className="text-sm text-gray-500">
                          Get notified about new products from your preferred producers
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={sourcingAlerts}
                        onChange={(e) => setSourcingAlerts(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Price Change Alerts</p>
                        <p className="text-sm text-gray-500">
                          Get notified when product prices change from your suppliers
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={priceChangeAlerts}
                        onChange={(e) => setPriceChangeAlerts(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Marketing Emails</p>
                        <p className="text-sm text-gray-500">
                          Receive tips, updates, and promotional content
                        </p>
                      </div>
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

            {/* Ordering Preferences */}
            {activeSection === "ordering" && (
              <div className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Ordering Preferences
                    </h2>
                    <p className="text-sm text-gray-600">
                      Configure your default ordering settings
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Default Payment Terms
                    </label>
                    <select
                      value={defaultPaymentTerms}
                      onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="COD">Cash on Delivery (COD)</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="GCASH">GCash</option>
                      <option value="CREDIT">Credit Terms (Net 30)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Default Currency
                    </label>
                    <select
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="PHP">Philippine Peso (PHP)</option>
                      <option value="USD">US Dollar (USD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Preferred Shipping Carrier
                    </label>
                    <select
                      value={preferredCarrier}
                      onChange={(e) => setPreferredCarrier(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="JT_EXPRESS">J&T Express</option>
                      <option value="LALAMOVE">Lalamove</option>
                      <option value="GRAB_EXPRESS">Grab Express</option>
                      <option value="LBC">LBC Express</option>
                      <option value="GOGO_XPRESS">GoGo Xpress</option>
                      <option value="NINJA_VAN">Ninja Van</option>
                      <option value="SELF_PICKUP">Self Pickup</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Auto-Reorder</p>
                        <p className="text-sm text-gray-500">
                          Automatically reorder when inventory runs low
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={autoReorder}
                        onChange={(e) => setAutoReorder(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Order Amount (Optional)
                    </label>
                    <p className="mb-1.5 text-xs text-gray-500">
                      Set a minimum order threshold for sourcing orders
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₱
                      </span>
                      <input
                        type="number"
                        value={minOrderThreshold}
                        onChange={(e) => setMinOrderThreshold(e.target.value)}
                        placeholder="Leave empty to disable"
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeSection === "privacy" && (
              <div className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Eye className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
                    <p className="text-sm text-gray-600">
                      Control your visibility and data preferences
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">Public Profile</p>
                      <p className="text-sm text-gray-500">
                        Allow your business to appear in search results
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={publicProfile}
                        onChange={(e) => setPublicProfile(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">Show Business Phone</p>
                      <p className="text-sm text-gray-500">
                        Display phone number on your public profile
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={showBusinessPhone}
                        onChange={(e) => setShowBusinessPhone(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">Show Business Email</p>
                      <p className="text-sm text-gray-500">
                        Display email address on your public profile
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={showBusinessEmail}
                        onChange={(e) => setShowBusinessEmail(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">Allow Producer Messages</p>
                      <p className="text-sm text-gray-500">
                        Let producers contact you directly
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={allowProducerMessages}
                        onChange={(e) => setAllowProducerMessages(e.target.checked)}
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
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                    <p className="text-sm text-gray-600">
                      Manage your password and account security
                    </p>
                  </div>
                </div>

                {/* Change Password Section */}
                <div className="mb-8 rounded-lg border border-gray-200 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Change Password</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <Button
                      onClick={handlePasswordChange}
                      disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                      className="mt-2"
                    >
                      {isSaving ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Lock className="mr-2 h-4 w-4" />
                      )}
                      Update Password
                    </Button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">Danger Zone</h3>
                  </div>

                  <p className="mb-4 text-sm text-red-700">
                    Once you delete your account, there is no going back. All your data,
                    orders, and business history will be permanently removed.
                  </p>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
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
