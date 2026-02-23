'use client';

import { useState, useEffect } from 'react';

export default function LoadingText() {
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
      <div className="p-4 m-4 flex flex-row justify-center">
        <h1 className="font-bold text-primary text-center text-3xl">Cargando</h1>
        {Array.from(Array(numDots).keys()).map((x) => (
          <h1 key={x} className="pt-2 font-bold text-primary text-center text-3xl animate-bounce">
            .
          </h1>
        ))}
        {Array.from(Array(3 - numDots).keys()).map((x) => (
          <h1 key={x} className="font-bold text-transparent text-center text-3xl">
            .
          </h1>
        ))}
      </div>
    </>
  );
}
