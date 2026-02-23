'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export type ErrorTextProps = {
  error: Error | null;
};

export default function ErrorText(props: ErrorTextProps) {
  const [numDots, setNumDots] = useState(0);

  const updateNumDots = () => {
    if (numDots === 3) {
      return;
    } else {
      setNumDots(numDots + 1);
    }
  };

  useEffect(() => {
    setTimeout(updateNumDots, 250);
  });
  return (
    <>
      <Card className="p-4 m-4">
        <h1 className="font-bold text-primary text-center text-3xl">Error</h1>
        <p className="pl-4 text-secondary text-xl">
          <strong>Tipo: </strong>
          {props.error?.name || ''}
        </p>
        <p className="pl-4 text-secondary text-xl">
          <strong>Mensaje: </strong>
          {props.error?.message || ''}
        </p>
        <p className="pl-4 text-secondary text-xl">
          <strong>Traza de la pila: </strong>
        </p>
        <div className="p-4 rounded-lg shadow-lg w-10/12 self-center bg-muted">
          <pre className="pb-4 text-secondary text-md text-wrap">{props.error?.stack || ''}</pre>
        </div>
        <Link
          href="/"
          className="self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-xl h-12 w-11/12 md:w-1/4"
        >
          Volver al inicio
        </Link>
      </Card>
    </>
  );
}
