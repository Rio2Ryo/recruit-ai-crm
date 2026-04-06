export function Header({ title }: { title: string }) {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
    </header>
  );
}
