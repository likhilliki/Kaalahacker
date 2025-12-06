import { Shield } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Shield className={`${sizeClasses[size]} text-primary`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-heading font-bold text-primary-foreground ${size === "lg" ? "text-xs" : "text-[8px]"}`}>
            K
          </span>
        </div>
      </div>
      {showText && (
        <span className={`font-heading font-bold ${textClasses[size]}`}>
          Kaala<span className="text-primary">.hacker</span>
        </span>
      )}
    </div>
  );
}
