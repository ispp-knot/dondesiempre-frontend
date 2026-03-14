import { NIL as NIL_UUID } from 'uuid';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { OutfitCreationProductDTO, OutfitDTO } from '@/lib/types/outfits/outfitsDto';

export function createEmptyOutfitDTO(): OutfitDTO {
  return {
    id: NIL_UUID,
    name: '',
    description: null,
    image: null,
    priceInCents: 0,
    discountedPriceInCents: 0,
    index: 0,
    storeId: 0,
    tags: [],
    products: [],
  };
}

export function productDTOToOufitCreationProductDTO(
  product: ProductDTO,
  index: number
): OutfitCreationProductDTO {
  return {
    productId: product.id,
    index: index,
  };
}
