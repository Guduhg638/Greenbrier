import { Flag, Star, StarHalf, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Review, PersonProfile } from "@workspace/api-client-react";
import { formatTimeAgo, getInitials } from "@/lib/utils";
import { Link } from "wouter";

export function FlagIcon({ type, className }: { type: 'good' | 'bad', className?: string }) {
  return (
    <div className={cn(
      "flex items-center justify-center rounded-full p-2 shadow-sm",
      type === 'good' ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20",
      className
    )}>
      <Flag className="w-5 h-5 fill-current" />
    </div>
  );
}

export function StarRating({ rating, className }: { rating: number, className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          className={cn(
            "w-4 h-4", 
            rating >= star ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
          )} 
        />
      ))}
    </div>
  );
}

export function ReviewCard({ review, onReport }: { review: Review, onReport?: (id: number) => void }) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Decorative top border based on flag type */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-1",
        review.flagType === 'good' ? "bg-success" : "bg-destructive"
      )} />
      
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-semibold">
            {getInitials("Anonymous")}
          </div>
          <div>
            <div className="font-semibold text-sm">Anonymous User</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              {formatTimeAgo(review.createdAt)}
              <span>•</span>
              <span className="font-medium text-foreground">
                for <Link href={`/person/${review.personSlug}`} className="hover:text-primary hover:underline">{review.personName}</Link>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <FlagIcon type={review.flagType} className="p-1.5 [&>svg]:w-4 [&>svg]:h-4" />
          <StarRating rating={review.rating} className="[&>svg]:w-3 [&>svg]:h-3" />
        </div>
      </div>
      
      <p className="text-foreground/90 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
        "{review.text}"
      </p>

      {onReport && (
        <div className="flex justify-end pt-3 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onReport(review.id)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Report
          </button>
        </div>
      )}
    </div>
  );
}

export function PersonCard({ person }: { person: PersonProfile }) {
  return (
    <Link href={`/person/${person.slug}`}>
      <div className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary flex items-center justify-center text-xl font-bold border border-primary/10">
            {getInitials(person.name)}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors">{person.name}</h3>
            {person.avgRating ? (
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={Math.round(person.avgRating)} className="[&>svg]:w-3.5 [&>svg]:h-3.5" />
                <span className="text-xs font-medium">{person.avgRating.toFixed(1)}</span>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground mt-1">No ratings yet</div>
            )}
          </div>
        </div>
        
        {person.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {person.description}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 bg-success/5 rounded-lg px-3 py-2 text-success border border-success/10">
            <Flag className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold">{person.goodCount}</span>
          </div>
          <div className="flex items-center gap-2 bg-destructive/5 rounded-lg px-3 py-2 text-destructive border border-destructive/10">
            <Flag className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold">{person.badCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
