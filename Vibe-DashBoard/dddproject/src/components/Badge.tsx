type Props = {
  label: string;
};

export default function Badge({ label }: Props) {
  return (
    <span className="px-3 py-1 text-xs rounded-full bg-yellow-500 text-black font-semibold mr-2">
      {label}
    </span>
  );
}