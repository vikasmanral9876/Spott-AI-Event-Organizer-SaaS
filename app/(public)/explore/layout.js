"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ExploreLayout = ({children}) => {
  const pathname = usePathname();
  const router = useRouter();

  const isMainExplore = pathname === "/explore";

  return (
    <div className="pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {!isMainExplore && (
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/explore")}
              className="gap-2 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Explore
            </Button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default ExploreLayout;
