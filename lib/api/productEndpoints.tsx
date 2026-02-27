import { Product } from '../types/products';
import { authorizedOfetch } from './authorizedOfetch';

export async function getProductsOfStorefront(storefrontId: number): Promise<Product[]> {
  try {
    return await authorizedOfetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/storefronts/' + storefrontId + '/products'
    );
  } catch (error) {
    throw error;
  }
}
