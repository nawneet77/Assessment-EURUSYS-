import { ContractStatus } from "@/context/contract-context";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  Clock, 
  FileSignature, 
  FileX, 
  Lock, 
  Send 
} from "lucide-react";

interface StatusBadgeProps {
  status: ContractStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    draft: "bg-gray-100 text-gray-700 border-gray-200",
    created: "bg-blue-50 text-blue-700 border-blue-200",
    approved: "bg-indigo-50 text-indigo-700 border-indigo-200",
    sent: "bg-purple-50 text-purple-700 border-purple-200",
    signed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    locked: "bg-slate-100 text-slate-700 border-slate-200",
    revoked: "bg-red-50 text-red-700 border-red-200",
  };

  const labels = {
    draft: "Draft",
    created: "Created",
    approved: "Approved",
    sent: "Sent for Signature",
    signed: "Signed",
    locked: "Locked",
    revoked: "Revoked",
  };

  const icons = {
    draft: Clock,
    created: CheckCircle2,
    approved: CheckCircle2,
    sent: Send,
    signed: FileSignature,
    locked: Lock,
    revoked: FileX,
  };

  const Icon = icons[status] || Clock;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles[status],
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {labels[status]}
    </span>
  );
}
