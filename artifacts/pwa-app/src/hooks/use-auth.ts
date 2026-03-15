import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetMe, 
  getGetMeQueryKey,
  useLogout,
  type CurrentUser 
} from "@workspace/api-client-react";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useGetMe({
    query: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        // Clear user from cache
        queryClient.setQueryData(getGetMeQueryKey(), null);
        window.location.href = "/";
      }
    }
  });

  return {
    user: user as CurrentUser | null | undefined,
    isLoading,
    isError: !!error,
    isAuthenticated: !!user,
    isVerified: !!user?.emailVerified,
    isMod: !!user?.isMod,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending
  };
}
