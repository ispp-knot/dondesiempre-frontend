import { Outfit } from '../types/outfits';
import { authorizedOfetch } from './authorizedOfetch';

export async function getOutfitsOfStore(storeId: number): Promise<Outfit[]> {
  try {
    return await authorizedOfetch(
      /* process.env.NEXT_PUBLIC_BACKEND_URL + */ '/api/v1/stores/' + storeId + '/outfits'
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
