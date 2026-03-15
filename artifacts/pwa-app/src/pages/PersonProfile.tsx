import { useState } from "react";
import { useRoute } from "wouter";
import { 
  useGetPersonBySlug, 
  useGetPersonReviews, 
  useCreateReview,
  useReportReview,
  type CreateReviewRequestFlagType 
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { ReviewCard, FlagIcon, StarRating } from "@/components/SharedUI";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { Flag, Star, ShieldAlert, Plus, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetPersonBySlugQueryKey, getGetPersonReviewsQueryKey } from "@workspace/api-client-react";

// Simple Dialog Implementation to avoid missing UI files
function Modal({ isOpen, onClose, title, children }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background rounded-2xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">✕</button>
        <h2 className="text-xl font-bold mb-4 font-display">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default function PersonProfile() {
  const [, params] = useRoute("/person/:slug");
  const slug = params?.slug || "";
  const { isVerified, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: person, isLoading: loadingPerson } = useGetPersonBySlug(slug);
  const { data: reviewsData, isLoading: loadingReviews } = useGetPersonReviews(slug);
  
  const createReviewMut = useCreateReview();
  const reportMut = useReportReview();

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    flagType: 'good' as CreateReviewRequestFlagType,
    rating: 5,
    text: ''
  });

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReviewId, setReportReviewId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState<any>('harmful');

  const handleCreateReview = () => {
    if (reviewForm.text.length < 10) {
      toast({ title: "Error", description: "Review must be at least 10 characters", variant: "destructive" });
      return;
    }
    
    createReviewMut.mutate({ slug, data: reviewForm }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Review published anonymously." });
        setIsReviewOpen(false);
        setReviewForm({ flagType: 'good', rating: 5, text: '' });
        queryClient.invalidateQueries({ queryKey: getGetPersonBySlugQueryKey(slug) });
        queryClient.invalidateQueries({ queryKey: getGetPersonReviewsQueryKey(slug, undefined) });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message || "Failed to post review", variant: "destructive" });
      }
    });
  };

  const handleReport = () => {
    if (!reportReviewId) return;
    reportMut.mutate({ id: reportReviewId, data: { reason: reportReason } }, {
      onSuccess: () => {
        toast({ title: "Reported", description: "This review has been flagged for moderation." });
        setIsReportOpen(false);
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message || "Failed to report", variant: "destructive" });
      }
    });
  };

  if (loadingPerson) return <div className="animate-pulse h-64 bg-secondary/50 rounded-3xl" />;
  if (!person) return <div className="text-center py-20 text-xl font-bold">Person not found.</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {/* Profile Header */}
      <div className="bg-card rounded-3xl p-6 md:p-10 shadow-sm border border-border flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary/10 to-blue-600/10 border-4 border-background shadow-lg flex items-center justify-center text-primary font-display font-bold text-3xl md:text-5xl shrink-0">
          {getInitials(person.name)}
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight mb-2">{person.name}</h1>
          {person.description && <p className="text-muted-foreground mb-4 max-w-2xl">{person.description}</p>}
          
          <div className="flex flex-wrap items-center gap-6 mt-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Avg Rating</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{person.avgRating ? person.avgRating.toFixed(1) : '-'}</span>
                <StarRating rating={Math.round(person.avgRating || 0)} className="[&>svg]:w-5 [&>svg]:h-5" />
              </div>
            </div>
            
            <div className="w-px h-10 bg-border hidden sm:block" />
            
            <div className="flex gap-4">
              <div className="flex items-center gap-3 bg-success/10 px-4 py-2 rounded-xl border border-success/20">
                <Flag className="w-5 h-5 text-success fill-success" />
                <div>
                  <div className="text-lg font-bold text-success leading-none">{person.goodCount}</div>
                  <div className="text-[10px] uppercase font-bold text-success/70 tracking-wider mt-0.5">Good</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-destructive/10 px-4 py-2 rounded-xl border border-destructive/20">
                <Flag className="w-5 h-5 text-destructive fill-destructive" />
                <div>
                  <div className="text-lg font-bold text-destructive leading-none">{person.badCount}</div>
                  <div className="text-[10px] uppercase font-bold text-destructive/70 tracking-wider mt-0.5">Bad</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col gap-3">
          <Button 
            size="lg" 
            className="w-full md:w-auto rounded-xl shadow-lg shadow-primary/25 font-bold"
            onClick={() => {
              if (!isAuthenticated) return toast({ title: "Login required", description: "You must log in to review." });
              if (!isVerified) return toast({ title: "Verification required", description: "Please verify your email first." });
              setIsReviewOpen(true);
            }}
          >
            <Plus className="w-5 h-5 mr-2" /> Leave Review
          </Button>
          {!isVerified && isAuthenticated && (
            <div className="text-xs text-amber-600 flex items-center justify-center gap-1 bg-amber-50 p-2 rounded-lg border border-amber-100">
              <Shield className="w-3.5 h-3.5" /> Verified users only
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-2">
          Reviews <span className="text-muted-foreground font-normal text-lg">({person.reviewCount})</span>
        </h2>
        
        {loadingReviews ? (
          <div className="grid gap-4">
            {[1,2].map(i => <div key={i} className="h-40 bg-secondary/50 rounded-2xl animate-pulse"/>)}
          </div>
        ) : reviewsData?.reviews?.length ? (
          <div className="grid gap-6">
            {reviewsData.reviews.map(review => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onReport={(id) => {
                  if (!isAuthenticated) return toast({ title: "Login required", description: "Log in to report."});
                  setReportReviewId(id);
                  setIsReportOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-3xl border border-border shadow-sm">
            <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to share your experience with {person.name}.</p>
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title={`Review ${person.name}`}>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold mb-3 block">Flag Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${reviewForm.flagType === 'good' ? 'border-success bg-success/10 text-success' : 'border-border bg-secondary hover:bg-secondary/80'}`}
                onClick={() => setReviewForm(prev => ({...prev, flagType: 'good'}))}
              >
                <Flag className="w-8 h-8 fill-current" />
                <span className="font-bold">Green Flag</span>
              </button>
              <button 
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${reviewForm.flagType === 'bad' ? 'border-destructive bg-destructive/10 text-destructive' : 'border-border bg-secondary hover:bg-secondary/80'}`}
                onClick={() => setReviewForm(prev => ({...prev, flagType: 'bad'}))}
              >
                <Flag className="w-8 h-8 fill-current" />
                <span className="font-bold">Red Flag</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Rating (1-5 stars)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setReviewForm(prev => ({...prev, rating: star}))} className="p-1 hover:scale-110 transition-transform">
                  <Star className={`w-8 h-8 ${reviewForm.rating >= star ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Your Review</label>
            <textarea 
              value={reviewForm.text}
              onChange={e => setReviewForm(prev => ({...prev, text: e.target.value}))}
              placeholder="Explain your flag. Keep it honest and respectful. Do NOT include personal addresses or phone numbers."
              className="w-full h-32 p-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
            <div className="text-xs text-muted-foreground mt-2 flex justify-between">
              <span>Minimum 10 characters</span>
              <span>{reviewForm.text.length} chars</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button 
              className="w-full h-12 text-lg font-bold" 
              onClick={handleCreateReview}
              disabled={createReviewMut.isPending || reviewForm.text.length < 10}
            >
              {createReviewMut.isPending ? "Posting..." : "Post Anonymous Review"}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Reviews are 100% anonymous
            </p>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} title="Report Review">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Why are you reporting this review?</p>
          <select 
            value={reportReason} 
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full p-3 rounded-xl border border-input bg-background"
          >
            <option value="harmful">Harmful / Abusive content</option>
            <option value="fake">Fake / Disinformation</option>
            <option value="personal_info">Contains personal info (address, phone)</option>
            <option value="spam">Spam</option>
            <option value="other">Other</option>
          </select>
          <Button 
            variant="destructive" 
            className="w-full mt-4" 
            onClick={handleReport}
            disabled={reportMut.isPending}
          >
            Submit Report
          </Button>
        </div>
      </Modal>

    </div>
  );
}
