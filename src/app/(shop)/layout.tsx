import { Header } from "~/components/layout/header";
import { CartDrawer } from "~/components/cart/cart-drawer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <CartDrawer />
    </>
  );
}
