import React, { createContext, useContext, useState, ReactNode } from "react";
import { nanoid } from "nanoid";
import { format } from "date-fns";

// Types
export type FieldType = "text" | "date" | "signature" | "checkbox" | "number";

export interface BlueprintField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
}

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  fields: BlueprintField[];
  createdAt: string;
}

export type ContractStatus = "draft" | "created" | "approved" | "sent" | "signed" | "locked" | "revoked";

export interface ContractFieldValue {
  fieldId: string;
  value: string | boolean;
}

export interface Contract {
  id: string;
  blueprintId: string;
  blueprintName: string; // Denormalized for easier display
  name: string;
  status: ContractStatus;
  values: Record<string, any>; // fieldId -> value
  createdAt: string;
  updatedAt: string;
  history: { status: ContractStatus; timestamp: string; note?: string }[];
}

interface ContractContextType {
  blueprints: Blueprint[];
  contracts: Contract[];
  addBlueprint: (blueprint: Omit<Blueprint, "id" | "createdAt">) => void;
  createContract: (blueprintId: string, values: Record<string, any>, name: string) => string;
  updateContractStatus: (contractId: string, status: ContractStatus) => void;
  updateContractValues: (contractId: string, values: Record<string, any>) => void;
  getBlueprint: (id: string) => Blueprint | undefined;
  getContract: (id: string) => Contract | undefined;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

// Mock Data
const MOCK_BLUEPRINTS: Blueprint[] = [
  {
    id: "bp_1",
    name: "Non-Disclosure Agreement (NDA)",
    description: "Standard mutual NDA for contractors and employees.",
    createdAt: new Date().toISOString(),
    fields: [
      { id: "f_1", type: "text", label: "Party A Name", required: true, placeholder: "Company Name" },
      { id: "f_2", type: "text", label: "Party B Name", required: true, placeholder: "Recipient Name" },
      { id: "f_3", type: "date", label: "Effective Date", required: true },
      { id: "f_4", type: "checkbox", label: "Include Non-Compete Clause", required: false },
      { id: "f_5", type: "signature", label: "Party B Signature", required: true },
    ],
  },
  {
    id: "bp_2",
    name: "Freelance Service Agreement",
    description: "Contract for freelance design and development work.",
    createdAt: new Date().toISOString(),
    fields: [
      { id: "f_1", type: "text", label: "Client Name", required: true },
      { id: "f_2", type: "text", label: "Project Scope", required: true, placeholder: "Brief description of work" },
      { id: "f_3", type: "number", label: "Total Fee ($)", required: true },
      { id: "f_4", type: "date", label: "Delivery Date", required: true },
      { id: "f_5", type: "signature", label: "Freelancer Signature", required: true },
      { id: "f_6", type: "signature", label: "Client Signature", required: true },
    ],
  },
];

const MOCK_CONTRACTS: Contract[] = [
  {
    id: "ct_1",
    blueprintId: "bp_1",
    blueprintName: "Non-Disclosure Agreement (NDA)",
    name: "NDA - Nawneet Kumar",
    status: "signed",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    values: {
      "f_1": "Acme Corp",
      "f_2": "Nawneet Kumar",
      "f_3": "2024-05-01",
      "f_4": true,
      "f_5": "Signed by Nawneet Kumar",
    },
    history: [
      { status: "created", timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
      { status: "approved", timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
      { status: "sent", timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
      { status: "signed", timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
    ],
  },
  {
    id: "ct_2",
    blueprintId: "bp_2",
    blueprintName: "Freelance Service Agreement",
    name: "Website Redesign Project",
    status: "approved",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    values: {
      "f_1": "TechStart Inc",
      "f_2": "Full website redesign including homepage and about page.",
      "f_3": "5000",
      "f_4": "2024-06-15",
    },
    history: [
      { status: "created", timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
      { status: "approved", timestamp: new Date(Date.now() - 3600000).toISOString() },
    ],
  },
];

export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const [blueprints, setBlueprints] = useState<Blueprint[]>(MOCK_BLUEPRINTS);
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS);

  const addBlueprint = (blueprintData: Omit<Blueprint, "id" | "createdAt">) => {
    const newBlueprint: Blueprint = {
      ...blueprintData,
      id: `bp_${nanoid(6)}`,
      createdAt: new Date().toISOString(),
    };
    setBlueprints((prev) => [newBlueprint, ...prev]);
  };

  const createContract = (blueprintId: string, values: Record<string, any>, name: string) => {
    const blueprint = blueprints.find((b) => b.id === blueprintId);
    if (!blueprint) throw new Error("Blueprint not found");

    const newContract: Contract = {
      id: `ct_${nanoid(6)}`,
      blueprintId,
      blueprintName: blueprint.name,
      name,
      status: "created",
      values,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{ status: "created", timestamp: new Date().toISOString() }],
    };
    setContracts((prev) => [newContract, ...prev]);
    return newContract.id;
  };

  const updateContractStatus = (contractId: string, status: ContractStatus) => {
    setContracts((prev) =>
      prev.map((contract) => {
        if (contract.id !== contractId) return contract;
        
        // Prevent updates if locked or revoked (unless specifically allowed flows)
        if (contract.status === "locked" || contract.status === "revoked") {
           // Allow unlocking? Maybe not for this strict lifecycle.
           // Actually, let's keep it strict as per requirements.
           return contract;
        }

        return {
          ...contract,
          status,
          updatedAt: new Date().toISOString(),
          history: [...contract.history, { status, timestamp: new Date().toISOString() }],
        };
      })
    );
  };

  const updateContractValues = (contractId: string, values: Record<string, any>) => {
    setContracts((prev) =>
      prev.map((contract) => {
        if (contract.id !== contractId) return contract;
        if (contract.status === "locked" || contract.status === "revoked" || contract.status === "signed") {
            // Cannot edit values in these states
            return contract; 
        }
        return {
          ...contract,
          values: { ...contract.values, ...values },
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const getBlueprint = (id: string) => blueprints.find((b) => b.id === id);
  const getContract = (id: string) => contracts.find((c) => c.id === id);

  return (
    <ContractContext.Provider
      value={{
        blueprints,
        contracts,
        addBlueprint,
        createContract,
        updateContractStatus,
        updateContractValues,
        getBlueprint,
        getContract,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContracts = () => {
  const context = useContext(ContractContext);
  if (!context) throw new Error("useContracts must be used within a ContractProvider");
  return context;
};
