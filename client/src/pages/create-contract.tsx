import React, { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { useContracts, Blueprint } from "@/context/contract-context";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Helper to dynamically parse query params
const useQueryParams = () => {
  const search = useSearch();
  return new URLSearchParams(search);
};

export default function CreateContract() {
  const { blueprints, createContract } = useContracts();
  const [, setLocation] = useLocation();
  const query = useQueryParams();
  const { toast } = useToast();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(query.get("blueprint"));
  
  const selectedBlueprint = blueprints.find(b => b.id === selectedBlueprintId);

  // Dynamically generate form based on blueprint
  // Since blueprints change, we handle form state manually for the dynamic parts or reset it
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [contractName, setContractName] = useState("");

  const handleBlueprintSelect = (id: string) => {
    setSelectedBlueprintId(id);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlueprint || !contractName) return;

    // Basic validation
    const missingFields = selectedBlueprint.fields
      .filter(f => f.required && !formData[f.id])
      .map(f => f.label);

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    const id = createContract(selectedBlueprint.id, formData, contractName);
    toast({
      title: "Contract Created",
      description: "Draft contract has been created successfully.",
    });
    setLocation(`/contracts/${id}`);
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  // Skip step 1 if blueprint pre-selected
  useEffect(() => {
    if (query.get("blueprint")) {
      setStep(2);
    }
  }, [query]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Contract</h1>
          <p className="text-muted-foreground mt-2">
            {step === 1 ? "Select a blueprint to get started." : `Drafting contract from: ${selectedBlueprint?.name}`}
          </p>
        </div>

        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            {blueprints.map((blueprint) => (
              <button
                key={blueprint.id}
                onClick={() => handleBlueprintSelect(blueprint.id)}
                className="flex flex-col items-start p-6 h-full rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <div className="p-2 bg-primary/10 rounded-lg text-primary mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg">{blueprint.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{blueprint.description}</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && selectedBlueprint && (
          <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-right-8 duration-500">
             <Card>
                <CardHeader>
                   <CardTitle>Contract Details</CardTitle>
                   <CardDescription>General information about this agreement.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                      <Label htmlFor="contract-name">Contract Name</Label>
                      <Input 
                        id="contract-name" 
                        value={contractName}
                        onChange={(e) => setContractName(e.target.value)}
                        placeholder={`e.g. ${selectedBlueprint.name} for Client X`}
                        required
                      />
                   </div>
                </CardContent>
             </Card>

             <Card>
                <CardHeader>
                   <CardTitle>Fields</CardTitle>
                   <CardDescription>Fill in the required information for this template.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   {selectedBlueprint.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                         <Label htmlFor={field.id}>
                            {field.label} {field.required && <span className="text-destructive">*</span>}
                         </Label>
                         
                         {field.type === 'text' && (
                            <Input 
                               id={field.id}
                               placeholder={field.placeholder}
                               onChange={(e) => handleInputChange(field.id, e.target.value)}
                               required={field.required}
                            />
                         )}
                         
                         {field.type === 'number' && (
                            <Input 
                               id={field.id}
                               type="number"
                               onChange={(e) => handleInputChange(field.id, e.target.value)}
                               required={field.required}
                            />
                         )}

                         {field.type === 'date' && (
                            <Input 
                               id={field.id}
                               type="date"
                               onChange={(e) => handleInputChange(field.id, e.target.value)}
                               required={field.required}
                            />
                         )}

                         {field.type === 'checkbox' && (
                            <div className="flex items-center space-x-2 pt-1">
                               <input 
                                  type="checkbox"
                                  id={field.id}
                                  className="h-4 w-4 rounded border-gray-300"
                                  onChange={(e) => handleInputChange(field.id, e.target.checked)}
                               />
                               <span className="text-sm text-muted-foreground">Yes, include this provision</span>
                            </div>
                         )}

                         {field.type === 'signature' && (
                            <div className="h-20 border-2 border-dashed border-muted rounded-md flex items-center justify-center bg-muted/20 text-muted-foreground text-sm">
                               Signature field will be enabled during signing stage
                            </div>
                         )}
                      </div>
                   ))}
                </CardContent>
             </Card>

             <div className="flex justify-between pt-4">
                <Button type="button" variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit">
                   Create Draft
                   <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
             </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
