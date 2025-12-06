import { Shield, Lock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="secondary" className="gap-1.5">
        <Shield className="h-3.5 w-3.5" />
        SEBI Compliant
      </Badge>
      <Badge variant="secondary" className="gap-1.5">
        <Lock className="h-3.5 w-3.5" />
        Secure & Encrypted
      </Badge>
      <Badge variant="secondary" className="gap-1.5">
        <CheckCircle className="h-3.5 w-3.5" />
        No Stock Tips
      </Badge>
    </div>
  );
}

export function FooterTrustSection() {
  return (
    <div className="border-t bg-muted/30 py-8">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-sm text-muted-foreground">
              Kaala.hacker is a scam detection and investor education platform.
            </p>
            <p className="text-xs text-muted-foreground">
              We do not provide stock tips or investment advice. Educational content uses 3+ month old data per SEBI regulations.
            </p>
          </div>
          <TrustBadges />
        </div>
        <div className="mt-6 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            2024 Kaala.hacker. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </div>
  );
}
