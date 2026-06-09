export default function StatCard({ title, value, subtitle, subtitleColor = 'blue', icon: Icon, color = 'blue', onClick }) {
  const iconColors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    amber:  'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    red:    'bg-red-50 text-red-600',
    teal:   'bg-teal-50 text-teal-600',
  };
  const subtitleColors = {
    blue: 'text-blue-500', green: 'text-green-500',
    amber: 'text-amber-500', red: 'text-red-500', gray: 'text-gray-400',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-5 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          <p className="text-sm font-medium text-gray-600 mt-1">{title}</p>
          {subtitle && (
            <p className={`text-xs mt-2 flex items-center gap-1 cursor-pointer hover:underline ${subtitleColors[subtitleColor] || subtitleColors.blue}`}>
              {subtitle} →
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl flex-shrink-0 ml-3 ${iconColors[color]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
