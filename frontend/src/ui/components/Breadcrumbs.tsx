import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav className={clsx('flex', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon
                className="h-4 w-4 text-gray-400 dark:text-gray-600 mx-2"
                aria-hidden="true"
              />
            )}
            {item.href && index < items.length - 1 ? (
              <Link
                to={item.href}
                className="text-sm text-[#14181b] dark:text-[#ffffff] hover:text-[#ff9800] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={clsx(
                  'text-sm',
                  index === items.length - 1
                    ? 'text-[#121212] dark:text-[#f1f4f8] font-medium'
                    : 'text-[#14181b] dark:text-[#ffffff]'
                )}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
