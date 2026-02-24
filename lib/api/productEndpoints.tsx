import { Product } from '../types/products';
import { authorizedOfetch } from './authorizedOfetch';

export async function getProductsOfStore(storeId: number): Promise<Product[]> {
  try {
    return await authorizedOfetch(
      /* process.env.NEXT_PUBLIC_BACKEND_URL + */ '/api/v1/stores/' + storeId + '/products'
    );
  } catch (error) {
    throw error;
  }
}
