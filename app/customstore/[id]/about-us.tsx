import Image from 'next/image';
export default function AboutUs({ description }: { description: string }) {
  return (
    <div className="flex flex-col px-5 gap-4">
      <div className="flex flex-row items-center justify-center gap-2">
        <h1 className="text-primary text-xl md:text-2xl font-bold text-center">¿Quiénes somos?</h1>
        <button className="text-sm text-secondary font-medium hover:underline transition">
          <Image
            src="/icons/Edit.png"
            alt="Cambiar descripción"
            width={20}
            height={20}
            className="inline-block"
          />
        </button>
      </div>
      <div className="text-justify md:text-center text-dark-blue whitespace-pre-line">
        {description}
      </div>
    </div>
  );
}
