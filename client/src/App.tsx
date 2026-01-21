import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContractProvider } from "@/context/contract-context";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Blueprints from "@/pages/blueprints";
import CreateBlueprint from "@/pages/create-blueprint";
import CreateContract from "@/pages/create-contract";
import ContractDetails from "@/pages/contract-details";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/blueprints" component={Blueprints} />
      <Route path="/blueprints/new" component={CreateBlueprint} />
      <Route path="/contracts/new" component={CreateContract} />
      <Route path="/contracts/:id" component={ContractDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ContractProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ContractProvider>
    </QueryClientProvider>
  );
}

export default App;
