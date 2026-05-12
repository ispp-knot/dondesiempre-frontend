export interface ProductVariantDTO {
  id: string;
  size: { id: string; name: string };
  color: { id: string; name: string; hexCode?: string };
  isAvailable: boolean;
}

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
function orderSizes(sizes: { id: string; name: string }[]) {
  return [...sizes].sort((a, b) => {
    const aNum = parseFloat(a.name);
    const bNum = parseFloat(b.name);

    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;

    const aIdx = SIZE_ORDER.indexOf(a.name.toUpperCase());
    const bIdx = SIZE_ORDER.indexOf(b.name.toUpperCase());
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;

    if (!isNaN(aNum) && isNaN(bNum)) return 1;
    if (isNaN(aNum) && !isNaN(bNum)) return -1;

    return a.name.localeCompare(b.name);
  });
}

export default function ProductVariantSelector({
  variants,
  selectedSize,
  selectedColor,
  selectedVariant,
  onSizeChange,
  onColorChange,
  disabled = false,
}: {
  variants: ProductVariantDTO[];
  selectedSize: string | null;
  selectedColor: string | null;
  selectedVariant: ProductVariantDTO | null;
  onSizeChange: (sizeId: string) => void;
  onColorChange: (colorId: string) => void;
  disabled?: boolean;
}) {
  const allSizes = [...new Map(variants.map((v) => [v.size.id, v.size])).values()];
  const availableSizes = orderSizes(allSizes);

  const availableColors = selectedSize
    ? [
        ...new Map(
          variants
            .filter((v) => v.size.id === selectedSize && v.isAvailable)
            .map((v) => [v.color.id, v.color])
        ).values(),
      ]
    : [
        ...new Map(
          variants.filter((v) => v.isAvailable).map((v) => [v.color.id, v.color])
        ).values(),
      ];

  return (
    <div className="flex flex-col gap-5" data-testid="product-variants">
      {availableSizes.length > 0 && (
        <div className="flex flex-col gap-2" data-testid="product-size">
          <p className="font-bold text-secondary">Talla</p>
          <div className="flex flex-row flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => !disabled && onSizeChange(size.id)}
                className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-colors ${
                  selectedSize === size.id
                    ? 'border-secondary bg-secondary text-white'
                    : 'border-gray-300 text-secondary hover:border-secondary'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {availableColors.length > 0 && (
        <div className="flex flex-col gap-2" data-testid="product-color">
          <p className="font-bold text-secondary">Color</p>
          <div className="flex flex-row flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color.id}
                onClick={() => !disabled && onColorChange(color.id)}
                title={color.name}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 font-semibold text-sm transition-colors ${
                  selectedColor === color.id
                    ? 'border-secondary bg-secondary/10'
                    : 'border-gray-300 hover:border-secondary'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {color.hexCode && (
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                    style={{ backgroundColor: color.hexCode }}
                  />
                )}
                <span className="text-secondary">{color.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedSize && selectedColor && !selectedVariant && (
        <p className="text-sm text-destructive">Esta combinación no está disponible.</p>
      )}
    </div>
  );
}
