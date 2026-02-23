'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

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
          <p className="pb-4 text-secondary text-md">{props.error?.stack || ''}</p>
        </div>
      </Card>
    </>
  );
}
