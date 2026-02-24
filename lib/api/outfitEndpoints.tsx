import { Outfit } from '../types/outfits';
import { authorizedOfetch } from './authorizedOfetch';

export async function getOutfitsOfStorefront(storefrontId: number): Promise<Outfit[]> {
  try {
    return await authorizedOfetch(
      /* process.env.NEXT_PUBLIC_BACKEND_URL + */ '/api/v1/storefronts/' + storefrontId + '/outfits'
    );
  } catch (error) {
    throw error;
  }
}

export async function getOutfit(outfitId: number): Promise<Outfit> {
  try {
    return await authorizedOfetch(
      /* process.env.NEXT_PUBLIC_BACKEND_URL + */ '/api/v1/outfits/' + outfitId
    );
  } catch (error) {
    throw error;
  }
}
