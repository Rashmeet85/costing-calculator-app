import { NavLink } from "react-router-dom";
import InstallAppButton from "./InstallAppButton";

const navigation = [
  { to: "/", label: "Recipes" },
  { to: "/insights", label: "Insights" },
  { to: "/sales", label: "Sales" },
  { to: "/calendar", label: "Calendar" },
];

export default function AppShell({ children, user, onSignOut }) {
  const displayName = user.displayName?.split(" ")[0] || "Baker";

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="mobile-topbar glass-panel">
        <div>
          <p className="eyebrow">Costing Companion</p>
          <h1>Know what each bake earns</h1>
        </div>
        <div className="topbar-actions">
          <InstallAppButton />
          <button className="ghost-button" onClick={onSignOut}>
            {displayName}
          </button>
        </div>
      </header>

      <main className="mobile-page">{children}</main>

      <nav className="bottom-nav glass-panel">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "bottom-nav-link active" : "bottom-nav-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
