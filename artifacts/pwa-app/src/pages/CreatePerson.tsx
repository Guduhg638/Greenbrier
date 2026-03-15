import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useCreatePerson } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Shield } from "lucide-react";

export default function CreatePerson() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialName = params.get("name") || "";
  
  const [, setLocation] = useLocation();
  const { isAuthenticated, isVerified } = useAuth();
  const { toast } = useToast();
  const createMut = useCreatePerson();

  const [form, setForm] = useState({
    name: initialName,
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !isVerified) {
      toast({ title: "Error", description: "You must be verified to add people.", variant: "destructive" });
      return;
    }

    createMut.mutate({ data: form }, {
      onSuccess: (person) => {
        toast({ title: "Success", description: `${person.name} has been added to FlagIt.` });
        setLocation(`/person/${person.slug}`);
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message || "Failed to create person", variant: "destructive" });
      }
    });
  };

  if (!isAuthenticated) {
    return <div className="text-center py-20 font-bold">Please log in first.</div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-primary" />
          Add a Person
        </h1>
        <p className="text-muted-foreground mt-2">
          Create a profile for someone so the community can leave reviews. 
          Make sure they aren't already on FlagIt.
        </p>
      </div>

      <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-border">
        {!isVerified && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 flex items-start gap-3">
            <Shield className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <h4 className="font-bold">Verification Required</h4>
              <p className="text-sm mt-1">You must verify your email address before you can add new profiles to the platform.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold mb-2 block">Full Name *</label>
            <input 
              required
              minLength={2}
              maxLength={100}
              type="text" 
              value={form.name}
              onChange={e => setForm(prev => ({...prev, name: e.target.value}))}
              className="w-full p-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. John Doe"
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold mb-2 block">Description / Context (Optional)</label>
            <textarea 
              maxLength={500}
              value={form.description}
              onChange={e => setForm(prev => ({...prev, description: e.target.value}))}
              className="w-full h-32 p-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
              placeholder="e.g. Landlord in Brooklyn, NY. or Software Engineer at TechCorp."
            />
            <p className="text-xs text-muted-foreground mt-2">Do not include private addresses or phone numbers.</p>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full text-lg font-bold h-14 rounded-xl shadow-lg shadow-primary/25"
            disabled={!isVerified || createMut.isPending || form.name.length < 2}
          >
            {createMut.isPending ? "Creating..." : "Create Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
