import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { DashboardLayoutWrapper } from "~/components/dashboard/layout-wrapper";

export default async function MerchantDashboardLayout({
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
  if (userRole !== "MERCHANT") {
    const redirectPaths: Record<string, string> = {
      CUSTOMER: "/customer/dashboard",
      PRODUCER: "/producer/dashboard",
    };
    const redirectPath = redirectPaths[userRole];
    if (redirectPath) {
      redirect(redirectPath);
    }
  }

  // Fetch merchant business name
  const merchant = await db.merchant.findUnique({
    where: { userId: session.user.id },
    select: { businessName: true },
  });

  return (
    <DashboardLayoutWrapper
      role="MERCHANT"
      userName={session.user.name}
      userEmail={session.user.email}
      businessName={merchant?.businessName}
    >
      {children}
    </DashboardLayoutWrapper>
  );
}
