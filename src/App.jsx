import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import { useAuth } from "./hooks/useAuth";

const RecipesPage = lazy(() => import("./pages/RecipesPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const CostCalculatorPage = lazy(() => import("./pages/CostCalculatorPage"));
const SalesPage = lazy(() => import("./pages/SalesPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const CustomRecipePage = lazy(() => import("./pages/CustomRecipePage"));

function AuthGate({ onGoogle, authReady, authError, signingIn }) {
  return (
    <div className="auth-screen">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="glass-panel auth-card">
        <p className="eyebrow">Baker Business Companion</p>
        <h1>Pricing and daily profit, in one calm place.</h1>
        <p className="muted">
          Open your recipe from the Recipe App, price each ingredient once, and
          keep track of what the bakery is really making.
        </p>
        <button className="primary-button auth-button" onClick={onGoogle} disabled={signingIn}>
          {signingIn ? "Opening Google..." : "Continue with Google"}
        </button>
        {!authReady ? (
          <p className="muted">
            Sign-in should still open, but if it does not, the Firebase auth config needs attention.
          </p>
        ) : null}
        {authError ? <p className="auth-error">{authError}</p> : null}
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading, signingIn, authError, authAvailable, signInWithGoogle, signOutUser } = useAuth();

  if (loading) {
    return (
      <div className="auth-screen">
        <div className="glass-panel auth-card">
          <p className="eyebrow">Opening workspace</p>
          <h1>Loading your bakery numbers...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthGate authReady={authAvailable} authError={authError} signingIn={signingIn} onGoogle={signInWithGoogle} />;
  }

  return (
    <AppShell user={user} onSignOut={signOutUser}>
      <Suspense
        fallback={
          <div className="glass-panel section-card">
            <p className="eyebrow">Loading</p>
            <h2>Getting the next screen ready...</h2>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<RecipesPage user={user} />} />
          <Route path="/recipes/new" element={<CustomRecipePage user={user} />} />
          <Route path="/recipes/edit" element={<CustomRecipePage user={user} />} />
          <Route path="/costing" element={<CostCalculatorPage user={user} />} />
          <Route path="/insights" element={<DashboardPage user={user} />} />
          <Route path="/sales" element={<SalesPage user={user} />} />
          <Route path="/calendar" element={<CalendarPage user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
