"use client";

import { useState } from "react";
import { createOrganisation } from "../actions";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CreateOrganisationPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed) {
      setError("You must accept the Terms of Use to continue.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await createOrganisation(formData);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
    } catch (err) {
      // NEXT_REDIRECT will be thrown and caught by Next.js router
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md text-center">
        <h2 className="text-sm font-semibold text-slate-500 mb-2">Create a new organisation</h2>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">Start your free trial</h1>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Organisation name
            </label>
            <Input id="name" name="name" required className="h-11 border-slate-300" />
          </div>

          <div className="space-y-2">
            <label htmlFor="physicalAddress" className="text-sm font-medium text-slate-700">
              Physical address
            </label>
            <Input id="physicalAddress" name="physicalAddress" required className="h-11 border-slate-300" />
          </div>

          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-medium text-slate-700">
              Country
            </label>
            <Select name="country" required>
              <SelectTrigger className="h-11 border-slate-300">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
                <SelectItem value="New Zealand">New Zealand</SelectItem>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start space-x-3 pt-2">
            <input 
              type="checkbox"
              id="terms" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2d2a6e] focus:ring-[#2d2a6e]"
            />
            <label htmlFor="terms" className="text-sm text-slate-600 leading-tight">
              I have read and accept the <a href="#" className="text-blue-600 hover:underline">Terms of Use</a> and <a href="#" className="text-blue-600 hover:underline">AI Terms</a>. *
            </label>
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !agreed} 
              className="w-full h-12 bg-[#2d2a6e] hover:bg-[#201d51] text-white font-medium text-base rounded-md"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Start <span className="text-blue-400 font-bold ml-1">Now</span>
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full text-slate-500 hover:text-slate-800"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
