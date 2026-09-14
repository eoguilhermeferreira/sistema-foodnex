import { formatCurrency } from "@/lib/format";
import type { OrderItem, Address } from "@/types/domain";

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

const FOOTER = `━━━━━━━━━━━━━━━━━━\n\n_SISTEMA FOODNEX 1.0_\n_Gestão inteligente de pedidos_`;

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

function buildItemLines(items: OrderItem[]): string {
  const lines: string[] = [];
  let subtotal = 0;

  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    lines.push(`▪ ${item.quantity}x ${item.product_name}${item.size_name ? ` (${item.size_name})` : ""} — ${formatCurrency(itemTotal)}`);
    if (item.flavors && item.flavors.length > 0) {
      lines.push(`   Sabores: ${item.flavors.map((f) => f.name).join(", ")}`);
    }
    if (item.border_name) {
      lines.push(`   ➕ Borda: ${item.border_name}${item.border_price ? ` — ${formatCurrency(item.border_price)}` : ""}`);
    }
    if (item.additions?.length) {
      const addons = (item.additions as { name: string; qty: number; price: number }[])
        .map((a) => `${a.qty > 1 ? `${a.qty}x ` : ""}${a.name}`)
        .join(", ");
      lines.push(`   ➕ ${addons}`);
    }
    if (item.removed_ingredients?.length) {
      lines.push(`   ❌ Sem: ${item.removed_ingredients.join(", ")}`);
    }
    if (item.notes) {
      lines.push(`   📝 ${item.notes}`);
    }
  }

  lines.push(`\n*Subtotal: ${formatCurrency(subtotal)}*`);
  return lines.join("\n");
}

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
  address,
  changeFor,
  createdAt,
}: {
  instanceName: string;
  phone: string;
  orderCode: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  type: string;
  paymentMethod: string;
  pixKey?: string | null;
  notes?: string | null;
  address?: Address | null;
  changeFor?: number | null;
  createdAt?: string;
}) {
  if (!EVOLUTION_URL || !phone) return;

  const time = createdAt
    ? new Date(createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  let message =
    `*PEDIDO #${orderCode}*\n\n` +
    `✅ *SEU PEDIDO FOI CONFIRMADO!*\n\n` +
    `👤 Nome: ${customerName}\n` +
    `📞 Telefone: ${phone}\n` +
    `📦 Tipo de pedido: ${typeLabels[type] ?? type}\n`;

  if (type === "entrega" && address) {
    const parts = [
      address.street && address.number ? `${address.street}, ${address.number}` : null,
      address.complement || null,
      address.neighborhood || null,
      address.city && address.state ? `${address.city}/${address.state}` : null,
      address.zip_code ? `CEP ${address.zip_code}` : null,
      address.reference ? `Ref: ${address.reference}` : null,
    ].filter(Boolean);
    message += `📍 Endereço: ${parts.join(" — ")}\n`;
  }

  message +=
    `🕐 Horário do pedido: ${time}\n\n` +
    `🍽️ *PEDIDO*\n\n` +
    `${buildItemLines(items)}\n` +
    `Taxa de entrega: ${type === "entrega" ? "a combinar" : "—"}\n` +
    `*Total: ${formatCurrency(total)}*\n\n` +
    `💳 Forma de pagamento: ${paymentLabels[paymentMethod] ?? paymentMethod}\n`;

  if (paymentMethod === "dinheiro" && changeFor != null && changeFor > total) {
    message +=
      `💵 Troco para: ${formatCurrency(changeFor)}\n` +
      `💰 Troco: ${formatCurrency(changeFor - total)}\n`;
  }

  if (paymentMethod === "pix" && pixKey) {
    message += `💠 Chave PIX: *${pixKey}*\n`;
  }

  if (notes) {
    message += `📝 Obs: ${notes}\n`;
  }

  message += `\n${FOOTER}`;

  await sendSimpleWhatsApp(instanceName, phone, message);
}

export async function sendDeliveryDispatchedWhatsApp({
  instanceName, phone, customerName,
}: {
  instanceName: string;
  phone: string;
  customerName: string;
}) {
  const message =
    `🛵 *SEU PEDIDO SAIU PARA ENTREGA!*\n\n` +
    `Opa, ${customerName}! 😄\n\n` +
    `Seu pedido já saiu e está a caminho do endereço informado! 🏠📦\n\n` +
    `⏳ Agora é só aguardar! Em breve seu pedido chegará até você. 😊\n\n` +
    `Obrigado pela preferência! ❤️\n\n` +
    FOOTER;
  await sendSimpleWhatsApp(instanceName, phone, message);
}

export async function sendPickupReadyWhatsApp({
  instanceName, phone, customerName,
}: {
  instanceName: string;
  phone: string;
  customerName: string;
}) {
  const message =
    `📦 *SEU PEDIDO ESTÁ PRONTO PARA RETIRADA!*\n\n` +
    `Opa, ${customerName}! 😄\n\n` +
    `Seu pedido já está prontinho e esperando por você! 🍽️✨\n\n` +
    `É só passar no estabelecimento para retirar seu pedido. 😊\n\n` +
    `🙌 Estamos te esperando!\n` +
    `Obrigado pela preferência e bom apetite! ❤️😋\n\n` +
    FOOTER;
  await sendSimpleWhatsApp(instanceName, phone, message);
}
