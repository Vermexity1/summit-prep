import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", private: true },
  { to: "/practice", label: "Practice", private: true },
  { to: "/mock-tests", label: "Mock Tests", private: true },
  { to: "/learn", label: "Learn", private: false }
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="brand-lockup">
          <span className="brand-badge">SP</span>
          <div>
            <div className="brand-name">Summit Prep</div>
            <div className="brand-subtitle">Adaptive SAT and PSAT prep</div>
          </div>
        </NavLink>

        <nav className="site-nav">
          {navItems
            .filter((item) => (item.private ? Boolean(user) : true))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
        </nav>

        <div className="site-actions">
          {user ? (
            <>
              <div className="user-pill">
                <span>{user.name}</span>
                <small>{user.preferences?.targetExam || "SAT"} track</small>
              </div>
              <button className="ghost-button" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="ghost-button">
                Log in
              </NavLink>
              <NavLink to="/register" className="primary-button">
                Create account
              </NavLink>
            </>
          )}
        </div>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
