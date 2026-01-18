import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { DashboardSidebar } from "~/components/dashboard/sidebar";

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Redirect to correct dashboard if user has different role
  const userRole = session.user.role;
  if (userRole !== "CUSTOMER") {
    const redirectPaths: Record<string, string> = {
      MERCHANT: "/merchant/dashboard",
      PRODUCER: "/producer/dashboard",
    };
    const redirectPath = redirectPaths[userRole];
    if (redirectPath) {
      redirect(redirectPath);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar
        role="CUSTOMER"
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main className="ml-64 flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
