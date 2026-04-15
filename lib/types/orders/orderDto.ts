import { OrderItemDTO } from './orderItemDto';

export interface OrderDTO {
  id: string;
  orderCode: string;
  userId: string;
  orderDate: string;
  orderStatus: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'PICKED' | 'COMPLETED';
  totalPrice: number;
  storeName?: string;
  isPaid: boolean;
  items: OrderItemDTO[];
}
