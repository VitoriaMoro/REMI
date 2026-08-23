import Logo from './Logo';

export default function Nav({ view, onChangeView, favoritesCount }) {
  return (
    <nav className="topnav">
      <button type="button" className="topnav-brand" onClick={() => onChangeView('home')}>
        <Logo variant="light" size="sm" />
      </button>

      <div className="topnav-links">
        <button
          type="button"
          className={`topnav-link ${view !== 'favorites' ? 'is-active' : ''}`}
          onClick={() => onChangeView('home')}
        >
          Home
        </button>
        <button
          type="button"
          className={`topnav-link ${view === 'favorites' ? 'is-active' : ''}`}
          onClick={() => onChangeView('favorites')}
        >
          Favoritos{favoritesCount > 0 && ` (${favoritesCount})`}
        </button>
      </div>
    </nav>
  );
}
