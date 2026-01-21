import React, { useState } from "react";
import Layout from "@/components/layout";
import { useContracts } from "@/context/contract-context";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { Link } from "wouter";
import { Plus, ArrowRight, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { contracts } = useContracts();
  const [filter, setFilter] = useState<"all" | "active" | "signed" | "pending">("all");

  const filteredContracts = contracts.filter((c) => {
    if (filter === "all") return true;
    if (filter === "active") return ["created", "approved", "sent"].includes(c.status);
    if (filter === "signed") return c.status === "signed" || c.status === "locked";
    if (filter === "pending") return c.status === "sent";
    return true;
  });

  const stats = {
    total: contracts.length,
    active: contracts.filter((c) => ["created", "approved", "sent"].includes(c.status)).length,
    signed: contracts.filter((c) => c.status === "signed").length,
    pending: contracts.filter((c) => c.status === "sent").length,
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Overview of your contract lifecycle.</p>
          </div>
          <Link 
            href="/contracts/new"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium text-sm shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Contract
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <div className="h-2 w-2 rounded-full bg-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Signature</CardTitle>
              <div className="h-2 w-2 rounded-full bg-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signed</CardTitle>
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.signed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Contract List */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Contracts</h2>
            <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
              {["all", "active", "signed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all capitalize",
                    filter === f
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y">
            {filteredContracts.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No contracts found matching your filter.
              </div>
            ) : (
              filteredContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="group flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-foreground">{contract.name}</h3>
                      <p className="text-xs text-muted-foreground">{contract.blueprintName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="hidden md:block text-xs text-muted-foreground">
                      Created {format(new Date(contract.createdAt), "MMM d, yyyy")}
                    </div>
                    <StatusBadge status={contract.status} />
                    <Link 
                      href={`/contracts/${contract.id}`}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
