import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { DashboardLayoutWrapper } from "~/components/dashboard/layout-wrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Only allow ADMIN role
  if (session.user.role !== "ADMIN") {
    const redirectPaths: Record<string, string> = {
      CUSTOMER: "/customer/dashboard",
      MERCHANT: "/merchant/dashboard",
      PRODUCER: "/producer/dashboard",
    };
    const redirectPath = redirectPaths[session.user.role] ?? "/";
    redirect(redirectPath);
  }

  return (
    <DashboardLayoutWrapper
      role="ADMIN"
      userName={session.user.name}
      userEmail={session.user.email}
    >
      {children}
    </DashboardLayoutWrapper>
  );
}
