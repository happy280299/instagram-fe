import { Send } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DirectInboxPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState icon={Send} title="Your messages" description="Send private photos and messages to a friend or group." />
    </div>
  );
}
