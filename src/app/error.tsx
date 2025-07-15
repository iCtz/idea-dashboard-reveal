"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ServerCrash } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    // You can log the error to an error reporting service here
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-red-100 rounded-full p-4 w-fit">
            <ServerCrash className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="mt-4">Oops! Something Went Wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred. Please wait a moment and try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => reset()} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
