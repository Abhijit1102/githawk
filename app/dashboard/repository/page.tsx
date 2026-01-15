"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RepositoryListSkeleton } from "@/lib/module/repository/components/repository-skeleton";
import { useConnectRepository } from "@/lib/module/repository/hooks/use-connect-repository";
import { useRepositories } from "@/lib/module/repository/hooks/use-repositories";
import { ExternalLink, Search, Star } from "lucide-react";
import Loader from "@/components/Loader";
import { toast } from "sonner";

interface Repositories {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  isConnected?: boolean;
}

const RepositoryPage = () => {
  const router = useRouter();

  /**
   * 🔐 AUTH SESSION (ALWAYS CALLED)
   */
  const { data: session, isPending } = useSession();

  /**
   * 🔁 REDIRECT IF NOT AUTHENTICATED
   */
  useEffect(() => {
    if (!isPending && !session?.user) {
      toast.message("You need to login in!")
      router.replace("/");
    }
  }, [isPending, session, router]);

  /**
   * ⏳ WAIT FOR AUTH CHECK
   */
  if (isPending) {
    return (
      <Loader />
    );
  }

  /**
   * 🚫 BLOCK UI UNTIL REDIRECT
   */
  if (!session?.user) {
    return null;
  }

  /**
   * 📦 DATA HOOKS
   */
  const { 
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useRepositories();

  const { mutate: connectRepo } = useConnectRepository();
  const [localConnectingId, setLocalConnectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if(entries[0].isIntersecting && hasNextPage && !isFetchingNextPage){
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    const currentTarget = observerTarget.current;
    if(currentTarget) observer.observe(currentTarget);
    return () => { if(currentTarget) observer.unobserve(currentTarget); };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if(isLoading){
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">Manage and view all your Github repositories</p>
        </div>
        <RepositoryListSkeleton />
      </div>
    );
  }

  if (isError) return <div>Failed to load repositories.</div>;

  const allRepositories = data?.pages.flatMap(page => page) || [];
  const filteredRepositories = allRepositories.filter((repo: Repositories) => (
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  const handleConnect = (repo: Repositories) => {
    setLocalConnectedId(repo.id);
    connectRepo(
      {
        owner: repo.full_name.split("/")[0],
        repo: repo.name,
        githubId: repo.id
      },
      {
        onSettled: () => setLocalConnectedId(null)
      }
    );
  };

  /**
   * ✅ REPOSITORY PAGE UI
   */
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
        <p className="text-muted-foreground">Manage and view all your Github repositories</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredRepositories.map((repo: Repositories) => (
          <Card key={repo.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                    <Badge variant="outline">{repo.language || "Unknown"}</Badge>
                    {repo.isConnected && <Badge variant="secondary">Connected</Badge>}
                  </div>
                  <CardDescription>{repo.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    onClick={() => handleConnect(repo)}
                    disabled={localConnectingId === repo.id || repo.isConnected}
                    variant={repo.isConnected ? "outline" : "default"}
                  >
                    {localConnectingId === repo.id
                      ? "Connecting..."
                      : repo.isConnected
                      ? "Connected"
                      : "Connect"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">{repo.stargazers_count}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div ref={observerTarget} className="py-4">
        {isFetchingNextPage && <RepositoryListSkeleton />}
        {!hasNextPage && allRepositories.length > 0 && (
          <p className="text-center text-muted-foreground">No More Repositories</p>
        )}
      </div>
    </div>
  );
};

export default RepositoryPage;
