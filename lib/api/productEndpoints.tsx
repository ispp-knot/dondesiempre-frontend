import { getBackendUrl } from '@/lib/config';
import { Product } from '../types/products';
import { authorizedOfetch } from './authorizedOfetch';

export async function getProductsOfStorefront(storefrontId: string): Promise<Product[]> {
  return await authorizedOfetch(
    getBackendUrl() + '/api/v1/storefronts/' + storefrontId + '/products'
  );
}
