export interface PaymongoCheckoutParams {
  amount: number;
  description: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
  lineItems: Array<{
    name: string;
    quantity: number;
    amount: number;
  }>;
}

export async function createPaymongoCheckout(
  params: PaymongoCheckoutParams
): Promise<{ id: string; checkout_url: string }> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY!;

  const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(secretKey).toString("base64")}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          billing: params.customerEmail
            ? {
                email: params.customerEmail,
                name: params.customerName,
              }
            : undefined,
          line_items: params.lineItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            amount: item.amount,
            currency: "PHP",
          })),
          payment_method_types: [
            "card",
            "gcash",
            "grab_pay",
            "paymaya",
            "dob",
            "dob_ubp",
          ],
          description: params.description,
          send_email_receipt: true,
          success_url: params.successUrl,
          cancel_url: params.cancelUrl,
          metadata: {
            order_id: params.orderId,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const error: unknown = await response.json();
    console.error("Paymongo error:", error);
    throw new Error("Failed to create checkout session");
  }

  const data = (await response.json()) as {
    data: {
      id: string;
      attributes: {
        checkout_url: string;
      };
    };
  };
  return {
    id: data.data.id,
    checkout_url: data.data.attributes.checkout_url,
  };
}
