export default function AboutUs({ description }: { description: string }) {
  return (
    <div className="flex flex-col px-5 gap-4 mb-20">
      <h1 className="text-primary text-xl md:text-2xl font-bold text-center">¿Quiénes somos?</h1>
      <div className="text-justify md:text-center text-dark-blue whitespace-pre-line">
        {description}
      </div>
    </div>
  ); // Comment to solve linter
}
