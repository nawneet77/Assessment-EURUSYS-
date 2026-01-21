import React, { useState } from "react";
import Layout from "@/components/layout";
import { useContracts, FieldType, BlueprintField } from "@/context/contract-context";
import { useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";

const schema = z.object({
  name: z.string().min(3, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  fields: z.array(z.object({
    id: z.string(),
    label: z.string().min(1, "Label is required"),
    type: z.enum(["text", "date", "signature", "checkbox", "number"]),
    required: z.boolean(),
    placeholder: z.string().optional(),
  })).min(1, "At least one field is required"),
});

type FormValues = z.infer<typeof schema>;

export default function CreateBlueprint() {
  const { addBlueprint } = useContracts();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      fields: [
        { id: nanoid(), label: "Client Name", type: "text", required: true, placeholder: "Enter client name" }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  const onSubmit = (data: FormValues) => {
    addBlueprint({
      name: data.name,
      description: data.description,
      fields: data.fields as BlueprintField[], // Cast strictly
    });
    toast({
      title: "Blueprint created",
      description: "Your new contract template has been saved.",
    });
    setLocation("/blueprints");
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Blueprint</h1>
          <p className="text-muted-foreground mt-2">Design a new contract template structure.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Blueprint Name</Label>
                <Input id="name" {...form.register("name")} placeholder="e.g. Service Agreement" />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  {...form.register("description")} 
                  placeholder="Describe what this contract is for..." 
                  className="resize-none h-24"
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Form Fields</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ id: nanoid(), label: "", type: "text", required: true, placeholder: "" })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted group-hover:bg-primary/50 transition-colors" />
                  <CardContent className="pt-6 pl-6 flex gap-4 items-start">
                    <div className="mt-3 text-muted-foreground cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Label</Label>
                        <Input 
                          {...form.register(`fields.${index}.label`)} 
                          placeholder="Field label"
                        />
                         {form.formState.errors.fields?.[index]?.label && (
                          <p className="text-xs text-destructive">{form.formState.errors.fields[index]?.label?.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                         <Label>Type</Label>
                         <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            {...form.register(`fields.${index}.type`)}
                         >
                            <option value="text">Text Input</option>
                            <option value="date">Date Picker</option>
                            <option value="number">Number</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="signature">Signature</option>
                         </select>
                      </div>
                      <div className="col-span-2 flex items-center gap-4">
                         <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id={`req-${field.id}`}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              {...form.register(`fields.${index}.required`)}
                            />
                            <label htmlFor={`req-${field.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Required
                            </label>
                         </div>
                         {form.watch(`fields.${index}.type`) === 'text' && (
                            <Input 
                              {...form.register(`fields.${index}.placeholder`)} 
                              placeholder="Placeholder text (optional)"
                              className="flex-1"
                            />
                         )}
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {form.formState.errors.fields && (
               <p className="text-xs text-destructive mt-2">{form.formState.errors.fields.root?.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setLocation("/blueprints")}>Cancel</Button>
            <Button type="submit" className="min-w-[140px]">
              <Save className="w-4 h-4 mr-2" />
              Create Blueprint
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
