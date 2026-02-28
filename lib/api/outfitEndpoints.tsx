import { Outfit, OutfitCreation, OutfitCreationProduct, OutfitUpdate } from '../types/outfits';
import { authorizedOfetch } from './authorizedOfetch';

export async function getOutfitsOfStorefront(storefrontId: number): Promise<Outfit[]> {
  return await authorizedOfetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/storefronts/' + storefrontId + '/outfits'
  );
}

export async function getOutfit(outfitId: number): Promise<Outfit> {
  return await authorizedOfetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits/' + outfitId
  );
}

export async function deleteOutfit(outfitId: number): Promise<void> {
  return await authorizedOfetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits/' + outfitId,
    { method: 'DELETE' }
  );
}

export async function addTag(outfitId: number, tag: string): Promise<void> {
  return await authorizedOfetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits/' + outfitId + '/tags',
    { method: 'POST', body: tag }
  );
}

export async function removeTag(outfitId: number, tag: string): Promise<void> {
  return await authorizedOfetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits/' + outfitId + '/tags',
    { method: 'DELETE', body: tag }
  );
}

export async function addProduct(outfitId: number, product: OutfitCreationProduct): Promise<void> {
  return await authorizedOfetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits/' + outfitId + '/products',
    { method: 'POST', body: JSON.stringify(product) }
  );
}

export async function removeProduct(outfitId: number, productId: number): Promise<void> {
  return await authorizedOfetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits/' + outfitId + '/products/' + productId,
    { method: 'DELETE' }
  );
}

export async function sortProducts(
  outfitId: number,
  products: OutfitCreationProduct[]
): Promise<void> {
  return await authorizedOfetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits/' + outfitId + '/products/sort',
    { method: 'PATCH', body: products }
  );
}

export async function createOutfit(dto: OutfitCreation): Promise<void> {
  return await authorizedOfetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function updateOutfit(outfitId: number, dto: OutfitUpdate): Promise<void> {
  return await authorizedOfetch(
    process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits/' + outfitId,
    { method: 'PUT', body: JSON.stringify(dto) }
  );
}
