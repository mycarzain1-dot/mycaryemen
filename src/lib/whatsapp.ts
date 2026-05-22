export const WHATSAPP_NUMBER = "967733340222";
export const SALES_PHONE = "777472412";
export const DEV_PHONE = "780687704";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
