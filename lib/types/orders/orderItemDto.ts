export interface OrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantSize?: string;
  variantColor?: string;
  quantity: number;
  priceAtPurchase: number;
  subtotal: number;
}
