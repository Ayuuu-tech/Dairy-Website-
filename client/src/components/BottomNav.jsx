import { Link, useLocation } from 'react-router-dom';
import { Store, ClipboardList, Heart, User, CalendarDays, Star } from 'lucide-react';

const tabs = [
  { name: 'Shop', path: '/shop', icon: Store },
  { name: 'Subscriptions', path: '/subscriptions', icon: CalendarDays },
  { name: 'Orders', path: '/orders', icon: ClipboardList },
  { name: 'Favourites', path: '/favourites', icon: Heart },
  { name: 'Reviews', path: '/reviews', icon: Star },
  { name: 'Profile', path: '/profile', icon: User },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="flex items-center justify-around md:justify-center w-full md:w-auto md:gap-1 px-2 md:px-0 py-2 md:py-0">
      {tabs.map(tab => {
        const active = pathname === tab.path || (tab.path === '/shop' && pathname === '/');
        return (
          <Link key={tab.name} to={tab.path}
            className={`relative flex flex-col md:flex-row items-center justify-center md:gap-1.5 w-16 md:w-auto h-12 md:h-auto md:px-4 md:py-2 rounded-xl transition-all duration-200 ${
              active ? 'text-primary md:bg-primary-light/40' : 'text-gray-400 md:text-gray-500 hover:text-gray-800 md:hover:bg-gray-100/50'
            }`}>
            <tab.icon size={20} strokeWidth={active ? 2.5 : 2} className="md:w-[18px] md:h-[18px]"
              fill={active && tab.name === 'Favourites' ? 'currentColor' : 'none'} />
            <span className={`text-[12px] font-bold ${active ? 'text-primary' : 'text-gray-500'}`}>{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
