import { formatCurrency } from "@/lib/format";
import type { CartItem } from "@/contexts/CartContext";

const EVOLUTION_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL ?? "";
const EVOLUTION_KEY = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY ?? "";

const typeLabels: Record<string, string> = {
  entrega: "Entrega 🛵",
  retirada: "Retirada 🏃",
  mesa: "Mesa 🍽️",
};

const paymentLabels: Record<string, string> = {
  dinheiro: "Dinheiro 💵",
  pix: "Pix 📲",
  cartao_credito: "Cartão de Crédito 💳",
  cartao_debito: "Cartão de Débito 💳",
};

export async function sendOrderWhatsApp({
  instanceName,
  phone,
  orderCode,
  customerName,
  items,
  total,
  type,
  paymentMethod,
  pixKey,
  notes,
}: {
  instanceName: string;
  phone: string;
  orderCode: string;
  customerName: string;
  items: CartItem[];
  total: number;
  type: string;
  paymentMethod: string;
  pixKey?: string | null;
  notes?: string | null;
}) {
  if (!EVOLUTION_URL || !phone) return;

  // normalize phone: keep digits only, add 55 country code if needed
  const digits = phone.replace(/\D/g, "");
  const fullPhone = digits.startsWith("55") ? digits : `55${digits}`;

  const itemLines = items
    .map((item) => {
      let line = `▪ ${item.quantity}x ${item.product_name}`;
      if (item.size_name) line += ` (${item.size_name})`;
      if (item.flavors && item.flavors.length > 0) {
        line += `\n   Sabores: ${item.flavors.map((f) => f.name).join(", ")}`;
      }
      return line;
    })
    .join("\n");

  let message =
    `✅ *Pedido #${orderCode} confirmado!*\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `👤 ${customerName}\n` +
    `📦 ${typeLabels[type] ?? type}\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `${itemLines}\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `💰 *Total: ${formatCurrency(total)}*\n` +
    `💳 Pagamento: ${paymentLabels[paymentMethod] ?? paymentMethod}\n`;

  if (paymentMethod === "pix" && pixKey) {
    message += `🔑 Chave Pix: *${pixKey}*\n`;
  }

  if (notes) {
    message += `📝 Obs: ${notes}\n`;
  }

  message += `━━━━━━━━━━━━━━━━\n_Obrigado pela preferência! 🙏_`;

  try {
    await fetch(`${EVOLUTION_URL}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_KEY,
      },
      body: JSON.stringify({
        number: fullPhone,
        text: message,
      }),
    });
  } catch {
    // silently fail — order was already created
  }
}

async function sendSimpleWhatsApp(instanceName: string, phone: string, message: string) {
  if (!EVOLUTION_URL || !phone) return;
  const digits = phone.replace(/\D/g, "");
  const fullPhone = digits.startsWith("55") ? digits : `55${digits}`;
  try {
    await fetch(`${EVOLUTION_URL}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVOLUTION_KEY },
      body: JSON.stringify({ number: fullPhone, text: message }),
    });
  } catch {}
}

export async function sendDeliveryDispatchedWhatsApp({
  instanceName, phone, orderCode, customerName,
}: {
  instanceName: string;
  phone: string;
  orderCode: string;
  customerName: string;
}) {
  const message =
    `🛵 *Pedido #${orderCode} saiu para entrega!*\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `👤 ${customerName}, seu pedido está a caminho!\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `_Obrigado pela preferência! 🙏_`;
  await sendSimpleWhatsApp(instanceName, phone, message);
}

export async function sendPickupReadyWhatsApp({
  instanceName, phone, orderCode, customerName,
}: {
  instanceName: string;
  phone: string;
  orderCode: string;
  customerName: string;
}) {
  const message =
    `✅ *Pedido #${orderCode} pronto para retirada!*\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `👤 ${customerName}, pode vir buscar! 🏃\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `_Obrigado pela preferência! 🙏_`;
  await sendSimpleWhatsApp(instanceName, phone, message);
}
