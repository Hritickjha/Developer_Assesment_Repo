import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getUser } from "@/lib/auth";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import ClientsPage from "@/pages/clients";
import ClientDetailPage from "@/pages/client-detail";
import AdminIntegrationsPage from "@/pages/admin-integrations";
import AuditPage from "@/pages/audit";
import NotFound from "@/pages/not-found";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const user = getUser();
  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login"                component={LoginPage} />
      <Route path="/dashboard"            component={() => <PrivateRoute component={DashboardPage} />} />
      <Route path="/clients"              component={() => <PrivateRoute component={ClientsPage} />} />
      <Route path="/clients/:id"          component={() => <PrivateRoute component={ClientDetailPage} />} />
      <Route path="/admin/integrations"   component={() => <PrivateRoute component={AdminIntegrationsPage} />} />
      <Route path="/audit"                component={() => <PrivateRoute component={AuditPage} />} />
      <Route path="/"                     component={() => <Redirect to="/dashboard" />} />
      <Route                              component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
