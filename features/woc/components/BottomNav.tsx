import type { NavItem, Screen } from '../types/wocSessionTypes';

type BottomNavProps = {
  activeScreen: Screen;
  items: NavItem[];
  onNavigate: (screen: Screen) => void;
};

export function BottomNav({ activeScreen, items, onNavigate }: BottomNavProps) {
  return (
    <nav className="nav-dock" aria-label="Primary navigation">
      {items.map((item) => (
        <button
          className={activeScreen === item.screen ? 'nav-button active' : 'nav-button'}
          key={item.label}
          type="button"
          onClick={() => onNavigate(item.screen)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
