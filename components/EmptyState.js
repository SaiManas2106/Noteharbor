export default function EmptyState({ title, subtitle, action }) {
  return (
    <div className="text-center py-16 card rounded-2xl">
      <h3 className="text-xl font-semibold">{title}</h3>
      {subtitle && <p className="text-gray-300 mt-1">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
