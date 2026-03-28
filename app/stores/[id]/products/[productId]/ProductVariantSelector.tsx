interface ProductVariantDTO {
  id: string;
  size: { id: string; name: string };
  color: { id: string; name: string; hexCode?: string };
  isAvailable: boolean;
}

export default function ProductVariantSelector({
  variants,
  selectedSize,
  selectedColor,
  selectedVariant,
  onSizeChange,
  onColorChange,
}: {
  variants: ProductVariantDTO[];
  selectedSize: string | null;
  selectedColor: string | null;
  selectedVariant: ProductVariantDTO | null;
  onSizeChange: (sizeId: string) => void;
  onColorChange: (colorId: string) => void;
}) {
  const availableSizes = [...new Map(variants.map((v) => [v.size.id, v.size])).values()];

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
    <div className="flex flex-col gap-5">
      {availableSizes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-bold text-secondary">Talla</p>
          <div className="flex flex-row flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => onSizeChange(size.id)}
                className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-colors ${
                  selectedSize === size.id
                    ? 'border-secondary bg-secondary text-white'
                    : 'border-gray-300 text-secondary hover:border-secondary'
                }`}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {availableColors.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-bold text-secondary">Color</p>
          <div className="flex flex-row flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color.id}
                onClick={() => onColorChange(color.id)}
                title={color.name}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 font-semibold text-sm transition-colors ${
                  selectedColor === color.id
                    ? 'border-secondary bg-secondary/10'
                    : 'border-gray-300 hover:border-secondary'
                }`}
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
