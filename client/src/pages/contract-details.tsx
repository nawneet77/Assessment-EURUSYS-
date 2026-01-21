import React, { useState } from "react";
import Layout from "@/components/layout";
import { useContracts, ContractStatus } from "@/context/contract-context";
import { useRoute, useLocation } from "wouter";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import { CheckCircle2, Send, XCircle, Lock, PenTool, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function ContractDetails() {
  const [, params] = useRoute("/contracts/:id");
  const { getContract, getBlueprint, updateContractStatus, updateContractValues } = useContracts();
  const { toast } = useToast();
  const [isSigning, setIsSigning] = useState(false);
  const [signature, setSignature] = useState("");

  if (!params?.id) return <div>Invalid ID</div>;

  const contract = getContract(params.id);
  if (!contract) return <Layout><div className="p-8">Contract not found</div></Layout>;

  const blueprint = getBlueprint(contract.blueprintId);
  if (!blueprint) return <Layout><div className="p-8">Blueprint not found</div></Layout>;

  const handleStatusChange = (newStatus: ContractStatus) => {
    updateContractStatus(contract.id, newStatus);
    toast({
      title: "Status Updated",
      description: `Contract moved to ${newStatus}.`,
    });
  };

  const handleSign = () => {
    if (!signature) return;
    
    // Find signature field(s)
    const sigField = blueprint.fields.find(f => f.type === 'signature');
    if (sigField) {
        updateContractValues(contract.id, { [sigField.id]: signature });
    }
    
    updateContractStatus(contract.id, "signed");
    setIsSigning(false);
    toast({
        title: "Contract Signed",
        description: "Signature recorded successfully.",
    });
  };

  const isEditable = !["locked", "revoked", "signed"].includes(contract.status);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-3xl font-bold tracking-tight">{contract.name}</h1>
               <StatusBadge status={contract.status} className="text-sm px-3 py-1" />
            </div>
            <p className="text-muted-foreground">
               Based on <span className="font-medium text-foreground">{blueprint.name}</span> • Created {format(new Date(contract.createdAt), "PPP")}
            </p>
          </div>

          <div className="flex items-center gap-2">
             {contract.status === 'created' && (
                <Button onClick={() => handleStatusChange("approved")} className="bg-indigo-600 hover:bg-indigo-700">
                   <CheckCircle2 className="w-4 h-4 mr-2" />
                   Approve
                </Button>
             )}
             
             {contract.status === 'approved' && (
                <Button onClick={() => handleStatusChange("sent")} className="bg-purple-600 hover:bg-purple-700">
                   <Send className="w-4 h-4 mr-2" />
                   Send for Signature
                </Button>
             )}

             {contract.status === 'sent' && (
                <Button onClick={() => setIsSigning(true)} className="bg-emerald-600 hover:bg-emerald-700">
                   <PenTool className="w-4 h-4 mr-2" />
                   Sign Contract
                </Button>
             )}

             {contract.status === 'signed' && (
                <Button onClick={() => handleStatusChange("locked")} variant="outline">
                   <Lock className="w-4 h-4 mr-2" />
                   Lock Record
                </Button>
             )}

             {!["revoked", "locked"].includes(contract.status) && (
                <Button onClick={() => handleStatusChange("revoked")} variant="ghost" className="text-destructive hover:bg-destructive/10">
                   <XCircle className="w-4 h-4 mr-2" />
                   Revoke
                </Button>
             )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           {/* Main Contract View */}
           <div className="lg:col-span-2 space-y-6">
              <Card className="min-h-[600px] flex flex-col shadow-md border-border/60">
                 <CardHeader className="bg-muted/30 border-b pb-4">
                    <div className="flex justify-between items-center">
                       <div className="uppercase tracking-widest text-xs font-bold text-muted-foreground">Official Document</div>
                       <div className="font-mono text-xs text-muted-foreground">ID: {contract.id}</div>
                    </div>
                 </CardHeader>
                 <CardContent className="flex-1 p-8 md:p-12 space-y-8 font-serif text-lg leading-relaxed text-card-foreground">
                    <div className="text-center border-b pb-8 mb-8">
                       <h2 className="text-2xl font-bold font-display text-primary">{blueprint.name.toUpperCase()}</h2>
                    </div>

                    <div className="space-y-6">
                       {blueprint.fields.map((field) => (
                          <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-dashed border-border/50 pb-4 last:border-0">
                             <div className="text-sm font-sans font-medium text-muted-foreground uppercase tracking-wide pt-1">
                                {field.label}
                             </div>
                             <div className="md:col-span-2 font-medium">
                                {field.type === 'signature' ? (
                                   <div className={`p-4 rounded border-2 border-dashed ${contract.values[field.id] ? 'border-emerald-500 bg-emerald-50/50' : 'border-muted'} flex items-center justify-center min-h-[80px]`}>
                                      {contract.values[field.id] ? (
                                         <div className="text-emerald-700 font-script text-2xl transform -rotate-2">
                                            {contract.values[field.id]}
                                         </div>
                                      ) : (
                                         <span className="text-muted-foreground text-sm italic">Pending Signature</span>
                                      )}
                                   </div>
                                ) : field.type === 'checkbox' ? (
                                   <div className="flex items-center gap-2">
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${contract.values[field.id] ? 'bg-primary border-primary text-primary-foreground' : 'border-input'}`}>
                                         {contract.values[field.id] && <Check className="w-3 h-3" />}
                                      </div>
                                      <span>{contract.values[field.id] ? "Included" : "Not Included"}</span>
                                   </div>
                                ) : (
                                   <span className="bg-yellow-50/50 px-1 py-0.5 rounded">
                                      {contract.values[field.id] || "—"}
                                   </span>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>
                 </CardContent>
                 <CardFooter className="bg-muted/30 border-t p-4 text-xs text-center text-muted-foreground justify-center">
                    Digitally managed by ContractFlow • {new Date().getFullYear()}
                 </CardFooter>
              </Card>
           </div>

           {/* Sidebar: History & Actions */}
           <div className="space-y-6">
              {isSigning && (
                 <Card className="border-emerald-200 bg-emerald-50/30 animate-in slide-in-from-right">
                    <CardHeader>
                       <CardTitle className="text-emerald-800">Sign Contract</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="space-y-2">
                          <Label>Type your full name to sign</Label>
                          <Input 
                             value={signature} 
                             onChange={(e) => setSignature(e.target.value)}
                             placeholder="e.g. Nawneet Kumar"
                             className="font-script text-lg"
                          />
                       </div>
                       <div className="flex gap-2">
                          <Button onClick={handleSign} className="w-full bg-emerald-600 hover:bg-emerald-700">Confirm Signature</Button>
                          <Button variant="ghost" onClick={() => setIsSigning(false)}>Cancel</Button>
                       </div>
                    </CardContent>
                 </Card>
              )}

              <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                       <History className="w-4 h-4" />
                       Audit Trail
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="relative pl-6 border-l ml-6 my-4 space-y-6 pr-4">
                       {contract.history.map((event, i) => (
                          <div key={i} className="relative">
                             <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-background bg-muted-foreground/30 ring-4 ring-background" />
                             <div className="text-sm font-medium capitalize">{event.status}</div>
                             <div className="text-xs text-muted-foreground">{format(new Date(event.timestamp), "PP p")}</div>
                          </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </Layout>
  );
}

// Helper icons
function Check({ className }: { className?: string }) {
   return (
      <svg 
         xmlns="http://www.w3.org/2000/svg" 
         viewBox="0 0 24 24" 
         fill="none" 
         stroke="currentColor" 
         strokeWidth="2" 
         strokeLinecap="round" 
         strokeLinejoin="round" 
         className={className}
      >
         <polyline points="20 6 9 17 4 12" />
      </svg>
   )
}
