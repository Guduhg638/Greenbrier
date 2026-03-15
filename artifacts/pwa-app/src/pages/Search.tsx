import { useSearch } from "wouter";
import { useSearchPeople } from "@workspace/api-client-react";
import { PersonCard } from "@/components/SharedUI";
import { Users, Search as SearchIcon, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Search() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const q = params.get("q") || "";

  const { data, isLoading } = useSearchPeople({ q }, {
    query: {
      enabled: q.length > 0
    }
  });

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display flex items-center gap-3">
          <SearchIcon className="w-8 h-8 text-primary" />
          Search Results
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Showing results for "<span className="font-semibold text-foreground">{q}</span>"
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      ) : data?.people && data.people.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.people.map(person => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card rounded-3xl border border-border shadow-sm">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No matches found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            We couldn't find anyone matching "{q}". They might not be on FlagIt yet.
          </p>
          <Link href={`/person/new?name=${encodeURIComponent(q)}`}>
            <Button size="lg" className="rounded-xl px-8 shadow-md">
              <UserPlus className="w-5 h-5 mr-2" /> Add them to FlagIt
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
