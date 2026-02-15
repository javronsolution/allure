"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

type PageWrapperProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
};

export const PageWrapper = ({
  children,
  title,
  description,
  showBack,
  actions,
}: PageWrapperProps) => {
  const router = useRouter();
  return (
    <div className="px-4 py-4 space-y-6">
      <div className="flex items-center justify-between">
        {title && (
          <div className="flex items-center justify-between">
           <div className="flex items-center gap-5">
             {showBack && (
              <Button onClick={() => router.back()} variant={'ghost'}>
                <ArrowLeft className="w-4 h-4 mr-1" />
              </Button>
            )}
            <h1 className="text-2xl font-bold">{title}</h1>
           </div>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {actions && <div>{actions}</div>}
      </div>

      {children}
    </div>
  );
};
