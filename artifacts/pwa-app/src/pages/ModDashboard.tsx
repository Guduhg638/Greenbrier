import { useState } from "react";
import { 
  useGetModerationReports, 
  useResolveReport,
  type GetModerationReportsStatus
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { ShieldAlert, Trash2, CheckCircle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetModerationReportsQueryKey, getGetPersonReviewsQueryKey } from "@workspace/api-client-react";
import { formatTimeAgo } from "@/lib/utils";

export default function ModDashboard() {
  const { isMod } = useAuth();
  const [tab, setTab] = useState<GetModerationReportsStatus>('pending');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetModerationReports({ status: tab });
  const resolveMut = useResolveReport();

  if (!isMod) return <div className="text-center py-20 font-bold text-destructive">Access Denied. Moderators only.</div>;

  const handleAction = (id: number, action: 'resolve' | 'dismiss', removeReview: boolean = false) => {
    resolveMut.mutate({ id, data: { action, removeReview } }, {
      onSuccess: () => {
        toast({ title: "Success", description: `Report ${action}ed.` });
        queryClient.invalidateQueries({ queryKey: getGetModerationReportsQueryKey({ status: tab }) });
        if (removeReview) {
          // Brutal invalidation of all reviews just to be safe
          queryClient.invalidateQueries({ queryKey: ['/api/people'] });
        }
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-3 border-b border-border pb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <ShieldAlert className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display">Moderation Panel</h1>
          <p className="text-muted-foreground">Review community reports and keep FlagIt safe.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['pending', 'resolved', 'dismissed'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-colors ${
              tab === t ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-secondary/50 rounded-2xl animate-pulse"/>)}
        </div>
      ) : data?.reports && data.reports.length > 0 ? (
        <div className="space-y-6">
          {data.reports.map(report => (
            <div key={report.id} className="bg-card border border-border shadow-sm rounded-2xl p-6 relative overflow-hidden">
              {/* Highlight bar for reason */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-md border border-amber-200">
                      Reason: {report.reason.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(report.createdAt)}</span>
                  </div>
                  
                  <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 mb-4">
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <Flag className={`w-4 h-4 ${report.reviewFlagType === 'good' ? 'text-success' : 'text-destructive'}`} />
                      <span className="font-semibold">Review of {report.personName}</span>
                    </div>
                    <p className="text-foreground/90 font-medium italic">"{report.reviewText}"</p>
                  </div>
                </div>

                {tab === 'pending' && (
                  <div className="flex flex-col gap-3 min-w-[200px] shrink-0 justify-center border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                    <Button 
                      variant="destructive" 
                      className="w-full flex justify-between"
                      onClick={() => handleAction(report.id, 'resolve', true)}
                      disabled={resolveMut.isPending}
                    >
                      <span>Delete Review</span>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full flex justify-between"
                      onClick={() => handleAction(report.id, 'dismiss')}
                      disabled={resolveMut.isPending}
                    >
                      <span>Dismiss Report</span>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card rounded-3xl border border-border shadow-sm">
          <ShieldAlert className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 text-muted-foreground">Queue is empty</h3>
          <p className="text-muted-foreground/70">No {tab} reports found.</p>
        </div>
      )}
    </div>
  );
}
