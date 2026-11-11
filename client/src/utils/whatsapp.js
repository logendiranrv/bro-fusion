/**
 * Formats a clean phone number for WhatsApp wa.me links
 * e.g. "9876543210" -> "919876543210", "+91 98765 43210" -> "919876543210"
 */
export const sanitizeWhatsAppNumber = (phone) => {
  if (!phone) return '919876543210';
  const cleaned = phone.toString().replace(/[^0-9]/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`; // Default to India prefix if 10 digits
  }
  return cleaned;
};

/**
 * Generate a WhatsApp link for a single product order (from Product Detail page)
 */
export const generateProductWhatsAppUrl = ({
  product,
  size,
  color,
  quantity = 1,
  whatsappNumber = '919876543210',
  currentUrl = window.location.href,
}) => {
  const number = sanitizeWhatsAppNumber(whatsappNumber);
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const total = price * quantity;

  const lines = [
    `👋 *Hi Bro Fusion!* I would like to order this item:`,
    ``,
    `🛍️ *Product:* ${product.name}`,
    `📏 *Size:* ${size || 'Standard'}`,
    `🎨 *Color:* ${color || 'Default'}`,
    `🔢 *Quantity:* ${quantity}`,
    `💰 *Price:* ₹${price} × ${quantity} = *₹${total}*`,
    ``,
    `🔗 *Product Link:* ${currentUrl}`,
    ``,
    `_Please confirm availability and share payment/delivery steps!_`,
  ];

  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${number}?text=${message}`;
};

/**
 * Generate a WhatsApp link for a full cart order (from Checkout page)
 */
export const generateOrderWhatsAppUrl = ({
  orderId,
  customerName,
  phone,
  shippingAddress,
  items = [],
  totalPrice = 0,
  paymentMethod = 'WhatsApp Order (GPay/PhonePe/COD)',
  whatsappNumber = '919876543210',
}) => {
  const number = sanitizeWhatsAppNumber(whatsappNumber);

  const formattedItems = items
    .map((item, index) => {
      const price = item.price || item.product?.price || 0;
      const sizeStr = item.size ? ` | Size: ${item.size}` : '';
      const colorStr = item.color ? ` | Color: ${item.color}` : '';
      return `${index + 1}. *${item.name || item.product?.name}* (x${item.quantity})${sizeStr}${colorStr} - ₹${price * item.quantity}`;
    })
    .join('\n');

  const lines = [
    `🛍️ *NEW ORDER - BRO FUSION*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Order ID:* #${orderId || 'PENDING'}`,
    `👤 *Customer:* ${customerName}`,
    `📞 *Phone:* ${phone}`,
    ``,
    `📍 *Delivery Address:*`,
    `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📦 *Items Ordered:*`,
    formattedItems,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💰 *Total Amount:* *₹${totalPrice}*`,
    `🚚 *Delivery:* FREE`,
    `💳 *Payment Method:* ${paymentMethod}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `_Please confirm my order and share payment details!_`,
  ];

  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${number}?text=${message}`;
};

/**
 * Generate simple chat link
 */
export const generateWhatsAppChatUrl = (whatsappNumber = '919876543210', defaultText = 'Hi Bro Fusion! I have a question about your products.') => {
  const number = sanitizeWhatsAppNumber(whatsappNumber);
  const message = encodeURIComponent(defaultText);
  return `https://wa.me/${number}?text=${message}`;
};

