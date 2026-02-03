"use client";

import { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  Store,
  Truck,
  Eye,
  Mail,
  ShoppingCart,
  Package,
  Snowflake,
  Lock,
  Trash2,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
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
    id: "store",
    title: "Store Preferences",
    description: "Configure default store settings",
    icon: Store,
  },
  {
    id: "shipping",
    title: "Shipping Defaults",
    description: "Set default shipping options",
    icon: Truck,
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

export default function ProducerSettingsPage() {
  const [activeSection, setActiveSection] = useState("notifications");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [quoteNotifications, setQuoteNotifications] = useState(true);
  const [shipmentNotifications, setShipmentNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Store preferences
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState("PHP");
  const [lowStockThreshold, setLowStockThreshold] = useState("10");

  // Shipping defaults
  const [defaultCarrier, setDefaultCarrier] = useState("JT_EXPRESS");
  const [requiresColdChain, setRequiresColdChain] = useState(true);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");
  const [handlingTime, setHandlingTime] = useState("1-2");

  // Privacy settings
  const [showBusinessPhone, setShowBusinessPhone] = useState(true);
  const [showBusinessEmail, setShowBusinessEmail] = useState(true);
  const [allowCustomerMessages, setAllowCustomerMessages] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

  // Security settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate saving
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
            Manage your account and store preferences
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
                        <p className="font-medium text-gray-900">New Order Alerts</p>
                        <p className="text-sm text-gray-500">
                          Get notified when you receive a new order
                        </p>
                      </div>
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
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Quote Confirmations</p>
                        <p className="text-sm text-gray-500">
                          Notify when a merchant accepts your quote
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={quoteNotifications}
                        onChange={(e) => setQuoteNotifications(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Shipment Updates</p>
                        <p className="text-sm text-gray-500">
                          Track shipment status changes
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={shipmentNotifications}
                        onChange={(e) => setShipmentNotifications(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Low Stock Alerts</p>
                        <p className="text-sm text-gray-500">
                          Get notified when products are running low
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={lowStockAlerts}
                        onChange={(e) => setLowStockAlerts(e.target.checked)}
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

            {/* Store Preferences */}
            {activeSection === "store" && (
              <div className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Store className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Store Preferences
                    </h2>
                    <p className="text-sm text-gray-600">
                      Configure your default store settings
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">Auto-Accept Small Orders</p>
                      <p className="text-sm text-gray-500">
                        Automatically accept orders under a certain threshold
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={autoAcceptOrders}
                        onChange={(e) => setAutoAcceptOrders(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div>
                      <p className="font-medium text-gray-900">Show Out of Stock Products</p>
                      <p className="text-sm text-gray-500">
                        Display products even when stock is zero
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={showOutOfStock}
                        onChange={(e) => setShowOutOfStock(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
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
                      Low Stock Alert Threshold
                    </label>
                    <p className="mb-1.5 text-xs text-gray-500">
                      Get notified when product stock falls below this number
                    </p>
                    <select
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="5">5 units</option>
                      <option value="10">10 units</option>
                      <option value="20">20 units</option>
                      <option value="50">50 units</option>
                      <option value="100">100 units</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Defaults */}
            {activeSection === "shipping" && (
              <div className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                    <Truck className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Shipping Defaults
                    </h2>
                    <p className="text-sm text-gray-600">
                      Set your default shipping options
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Default Shipping Carrier
                    </label>
                    <select
                      value={defaultCarrier}
                      onChange={(e) => setDefaultCarrier(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="JT_EXPRESS">J&T Express</option>
                      <option value="LALAMOVE">Lalamove</option>
                      <option value="GRAB_EXPRESS">Grab Express</option>
                      <option value="LBC">LBC Express</option>
                      <option value="GOGO_XPRESS">GoGo Xpress</option>
                      <option value="NINJA_VAN">Ninja Van</option>
                      <option value="SELF_DELIVERY">Self Delivery</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <Snowflake className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">Cold Chain Required</p>
                        <p className="text-sm text-gray-500">
                          Default setting for new products
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={requiresColdChain}
                        onChange={(e) => setRequiresColdChain(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Handling Time
                    </label>
                    <p className="mb-1.5 text-xs text-gray-500">
                      Time needed to prepare orders for shipping
                    </p>
                    <select
                      value={handlingTime}
                      onChange={(e) => setHandlingTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="same-day">Same Day</option>
                      <option value="1-2">1-2 Business Days</option>
                      <option value="3-5">3-5 Business Days</option>
                      <option value="1-week">1 Week</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Free Shipping Threshold (Optional)
                    </label>
                    <p className="mb-1.5 text-xs text-gray-500">
                      Offer free shipping for orders above this amount
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₱
                      </span>
                      <input
                        type="number"
                        value={freeShippingThreshold}
                        onChange={(e) => setFreeShippingThreshold(e.target.value)}
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
                      <p className="font-medium text-gray-900">Allow Customer Messages</p>
                      <p className="text-sm text-gray-500">
                        Let customers contact you directly
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={allowCustomerMessages}
                        onChange={(e) => setAllowCustomerMessages(e.target.checked)}
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
                    products, and order history will be permanently removed.
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
