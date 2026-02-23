'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiDiscountPercentFill } from 'react-icons/ri';

type Product = {
  index: number;
  name: string;
  description: string | null;
  image: string | null;
  price: number;
};

type Outfit = {
  index: number;
  name: string;
  description: string | null;
  image: string | null;
  price: number;
  discount: number;
  products: Product[];
};

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState(new Array<Outfit>());

  const initOutfits = (): void => {
    const testOutfits: Outfit[] = [
      {
        index: 0,
        name: 'Test outfit 1',
        description: 'Test outfit 1 description',
        image: null,
        price: 25.0,
        discount: 40.0,
        products: [
          {
            index: 0,
            name: 'Test product 1',
            description: 'Test product 1 description',
            image: 'static/img/blazer.png',
            price: 10.0,
          },
          {
            index: 1,
            name: 'Test product 2',
            description: 'Test product 2 description',
            image: 'static/img/trousers.png',
            price: 5.0,
          },
          {
            index: 2,
            name: 'Test product 2',
            description: 'Test product 2 description',
            image: 'static/img/trousers.png',
            price: 5.0,
          },
          {
            index: 3,
            name: 'Test product 2',
            description: 'Test product 2 description',
            image: 'static/img/trousers.png',
            price: 5.0,
          },
        ],
      },
      {
        index: 1,
        name: 'Test outfit 2',
        description: 'Test outfit 2 description',
        image: null,
        price: 20.0,
        discount: 0.0,
        products: [
          {
            index: 0,
            name: 'Test product 3',
            description: null,
            image: 'static/img/bufanda.png',
            price: 20.0,
          },
        ],
      },
      {
        index: 2,
        name: 'Test outfit 3',
        description: null,
        image: null,
        price: 30.0,
        discount: 0.0,
        products: [
          {
            index: 0,
            name: 'Test product 4',
            description: null,
            image: 'static/img/shoes.png',
            price: 20.0,
          },
          {
            index: 1,
            name: 'Test product 5',
            description: 'Test product 5 description',
            image: 'static/img/shirt.png',
            price: 10.0,
          },
        ],
      },
    ];
    setOutfits(testOutfits);
  };

  useEffect(() => {
    initOutfits();
  }, []);

  return (
    <>
      {outfits.map((o) => (
        <Card key={o.index} className="p-4 m-4">
          <div>
            {o.discount === 0.0 ? <></> : <RiDiscountPercentFill className="text-4xl" />}
            <h1 className="mb-3 font-bold text-primary text-center text-3xl">{o.name}</h1>
            {o.description ? (
              <p className="text-secondary text-center text-xl">{o.description}</p>
            ) : (
              <></>
            )}
          </div>
          <div className="flex flex-row w-fit max-w-11/12 self-center overflow-x-scroll items-center gap-4 p-4">
            {o.products.map((p) =>
              p.image ? (
                <img
                  key={p.index}
                  src={p.image}
                  alt={'Imagen de producto'}
                  className="w-30 h-30 md:w-50 md:h-50 object-cover shrink-0 rounded-lg shadow-lg"
                ></img>
              ) : (
                <></>
              )
            )}
          </div>
          {o.discount === 0.0 ? (
            <h1 className="font-bold text-primary text-center text-3xl">
              {`${o.price.toFixed(2).toString().replace('.', ',')}€`}
            </h1>
          ) : (
            <div className="flex flex-row self-center gap-3">
              <h1 className="text-primary text-center line-through text-3xl">
                {`${o.price.toFixed(2).toString().replace('.', ',')}€`}
              </h1>
              <h1 className="font-bold text-primary text-center text-3xl">
                {`${(o.price - o.price * (o.discount / 100.0)).toFixed(2).toString().replace('.', ',')}€`}
              </h1>
            </div>
          )}
          <Button className="self-center bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-xl h-12 w-11/12 md:w-1/4">
            Ver más
          </Button>
        </Card>
      ))}
    </>
  );
}
