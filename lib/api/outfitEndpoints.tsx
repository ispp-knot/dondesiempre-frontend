import { Outfit, OutfitCreationProduct, OutfitUpdate } from '../types/outfits';
import { authorizedOfetch } from './authorizedOfetch';

export async function getOutfitsOfStorefront(storefrontId: number): Promise<Outfit[]> {
  try {
    return await authorizedOfetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/storefronts/' + storefrontId + '/outfits'
    );
  } catch (error) {
    throw error;
  }
}

export async function getOutfit(outfitId: number): Promise<Outfit> {
  try {
    return await authorizedOfetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits/' + outfitId
    );
  } catch (error) {
    throw error;
  }
}

export async function deleteOutfit(outfitId: number): Promise<void> {
  try {
    return await authorizedOfetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits/' + outfitId,
      { method: 'DELETE' }
    );
  } catch (error) {
    throw error;
  }
}

export async function addTag(outfitId: number, tag: string): Promise<void> {
  try {
    return await authorizedOfetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits/' + outfitId + '/tags',
      { method: 'POST', body: tag }
    );
  } catch (error) {
    throw error;
  }
}

export async function removeTag(outfitId: number, tag: string): Promise<void> {
  try {
    return await authorizedOfetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits/' + outfitId + '/tags',
      { method: 'DELETE', body: tag }
    );
  } catch (error) {
    throw error;
  }
}

export async function addProduct(outfitId: number, product: OutfitCreationProduct): Promise<void> {
  try {
    return await authorizedOfetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits/' + outfitId + '/products',
      { method: 'POST', body: JSON.stringify(product) }
    );
  } catch (error) {
    throw error;
  }
}

export async function removeProduct(outfitId: number, productId: number): Promise<void> {
  try {
    return await authorizedOfetch(
      process.env.NEXT_PUBLIC_BACKEND_URL +
        '/api/v1/outfits/' +
        outfitId +
        '/products/' +
        productId,
      { method: 'DELETE' }
    );
  } catch (error) {
    throw error;
  }
}

export async function updateOutfit(outfitId: number, dto: OutfitUpdate): Promise<void> {
  try {
    return await authorizedOfetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/outfits/' + outfitId,
      { method: 'PUT', body: JSON.stringify(dto) }
    );
  } catch (error) {
    throw error;
  }
}
