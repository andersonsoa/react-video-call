interface Props {
  label: string;
  children: React.ReactNode;
}

export function Message(props: Props) {
  return (
    <div className="gap-2 text-sm bg-gray-100 shadow py-1 px-4 rounded-md">
      <div className="text-xs rounded-full font-bold">
        - {props.label.slice(0, 2)}...
      </div>
      <div className="flex-grow">{props.children}</div>
    </div>
  );
}
