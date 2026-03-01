import { GrSearch } from 'react-icons/gr';

export type NotFoundTextProps = {
  message: string;
};

export default function NotFoundText(props: Readonly<NotFoundTextProps>) {
  return (
    <div className="mt-16 flex flex-col items-center gap-4">
      <p className="text-secondary font-bold text-center text-4xl">¡Vaya!</p>
      <GrSearch className="mt-4 ml-4 text-8xl text-secondary"></GrSearch>
      <p className="mt-4 text-secondary text-center text-lg w-8/12">{props.message}</p>
    </div>
  );
}
