import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ROUTES } from '../core/config/constants';

interface NavigationLink {
  to: string;
  labelKey: string;
}

const navigationLinks: NavigationLink[] = [
  { to: ROUTES.MATCH, labelKey: 'nav.races' },
  { to: ROUTES.SYNTHESIS, labelKey: 'nav.synthesis' },
  { to: ROUTES.LIBRARY, labelKey: 'nav.library' },
];

interface NavigationLinksProps {
  className?: string;
  linkClassName?: string;
  activeLinkClassName?: string;
  onLinkClick?: () => void;
}

export const NavigationLinks: React.FC<NavigationLinksProps> = ({
  className,
  linkClassName,
  activeLinkClassName,
  onLinkClick,
}) => {
  const { t } = useTranslation();
  
  return (
    <nav className={className}>
      {navigationLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={onLinkClick}
          className={({ isActive }) =>
            clsx(
              'transition-colors',
              linkClassName,
              isActive && activeLinkClassName
            )
          }
        >
          {t(link.labelKey)}
        </NavLink>
      ))}
    </nav>
  );
};
