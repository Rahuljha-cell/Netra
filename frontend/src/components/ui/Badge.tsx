'use client';

import { CATEGORIES, SEVERITY_COLORS, CategoryKey } from '@/lib/constants';

interface CategoryBadgeProps {
  category: CategoryKey;
  className?: string;
}

export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const cat = CATEGORIES[category];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cat.lightBg} ${cat.textColor} ${className}`}>
      <span>{cat.icon}</span>
      {category}
    </span>
  );
}

interface SeverityBadgeProps {
  severity: keyof typeof SEVERITY_COLORS;
  label?: string;
  className?: string;
}

export function SeverityBadge({ severity, label, className = '' }: SeverityBadgeProps) {
  const colors = SEVERITY_COLORS[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {label || severity}
    </span>
  );
}
