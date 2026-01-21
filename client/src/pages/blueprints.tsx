import React from "react";
import Layout from "@/components/layout";
import { useContracts } from "@/context/contract-context";
import { Link } from "wouter";
import { Plus, FileText, Calendar, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";

export default function Blueprints() {
  const { blueprints } = useContracts();

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blueprints</h1>
            <p className="text-muted-foreground mt-2">Manage your contract templates.</p>
          </div>
          <Link 
            href="/blueprints/new"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium text-sm shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Blueprint
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blueprints.map((blueprint) => (
            <Card key={blueprint.id} className="group hover:shadow-md transition-all duration-300">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">{blueprint.name}</CardTitle>
                <CardDescription className="line-clamp-2">{blueprint.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                    {blueprint.fields.length} configurable fields
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Created {format(new Date(blueprint.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                 <Link 
                    href={`/contracts/new?blueprint=${blueprint.id}`}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 py-2.5 rounded-md transition-colors cursor-pointer"
                  >
                    Use Template
                    <ArrowRight className="w-4 h-4" />
                 </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
