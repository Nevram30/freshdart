"use client";

import { useState } from "react";
import { DashboardSidebar } from "./sidebar";
import { DashboardHeader } from "./header";

type UserRole = "CUSTOMER" | "MERCHANT" | "PRODUCER" | "ADMIN";

interface LayoutWrapperProps {
  role: UserRole;
  userName?: string | null;
  userEmail?: string | null;
  children: React.ReactNode;
}

export function DashboardLayoutWrapper({
  role,
  userName,
  userEmail,
  children,
}: LayoutWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role={role} isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <DashboardHeader
          userName={userName}
          userEmail={userEmail}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
