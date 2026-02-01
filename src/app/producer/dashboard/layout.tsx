export default function ProducerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Parent layout handles auth and wrapper
  return <>{children}</>;
}
