import { getBackendUrl } from '@/lib/config';
import { Outfit, OutfitCreation, OutfitCreationProduct, OutfitUpdate } from '../types/outfits';
import { authorizedOfetch } from './authorizedOfetch';

export async function getOutfitsOfStorefront(storefrontId: string): Promise<Outfit[]> {
  return await authorizedOfetch(
    getBackendUrl() + '/api/v1/storefronts/' + storefrontId + '/outfits'
  );
}

export async function getOutfit(outfitId: string): Promise<Outfit> {
  return await authorizedOfetch(getBackendUrl() + '/api/v1/outfits/' + outfitId);
}

export async function deleteOutfit(outfitId: string): Promise<void> {
  return await authorizedOfetch(getBackendUrl() + '/api/v1/outfits/' + outfitId, {
    method: 'DELETE',
  });
}

export async function addTag(outfitId: string, tag: string): Promise<void> {
  return await authorizedOfetch(getBackendUrl() + '/api/v1/outfits/' + outfitId + '/tags', {
    method: 'POST',
    body: tag,
  });
}

export async function removeTag(outfitId: string, tag: string): Promise<void> {
  return await authorizedOfetch(getBackendUrl() + '/api/v1/outfits/' + outfitId + '/tags', {
    method: 'DELETE',
    body: tag,
  });
}

export async function addProduct(outfitId: string, product: OutfitCreationProduct): Promise<void> {
  return await authorizedOfetch(getBackendUrl() + '/api/v1/outfits/' + outfitId + '/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export async function removeProduct(outfitId: string, productId: string): Promise<void> {
  return await authorizedOfetch(
    getBackendUrl() + '/api/v1/outfits/' + outfitId + '/products/' + productId,
    { method: 'DELETE' }
  );
}

export async function sortProducts(
  outfitId: string,
  products: OutfitCreationProduct[]
): Promise<void> {
  return await authorizedOfetch(
    getBackendUrl() + '/api/v1/outfits/' + outfitId + '/products/sort',
    { method: 'PATCH', body: products }
  );
}

export async function createOutfit(
  storefrontId: string,
  dto: OutfitCreation,
  image: File | null
): Promise<void> {
  const formData = new FormData();
  formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
  if (image) {
    formData.append('image', image);
  }
  return await authorizedOfetch(getBackendUrl() + '/api/v1/outfits', {
    method: 'POST',
    query: {
      storefrontId: storefrontId,
    },
    body: formData,
  });
}

export async function updateOutfit(
  outfitId: string,
  dto: OutfitUpdate,
  image: File | null
): Promise<void> {
  const formData = new FormData();
  formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
  if (image) {
    formData.append('image', image);
  }
  return await authorizedOfetch(getBackendUrl() + '/api/v1/outfits/' + outfitId, {
    method: 'PUT',
    body: formData,
  });
}
