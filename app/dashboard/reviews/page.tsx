"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import { ExternalLink, Clock, CheckCircle, XCircle } from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import { getReviews } from "@/lib/module/review/actions";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";


export default function ReviewsPage(){
    const {data:reviews, isLoading} = useQuery({
        queryKey:["reviews"],
        queryFn: async() => {
            return await getReviews()
        }
    });

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                {/* Page title */}
                <Skeleton className="h-8 w-1/3" />

                {/* Reviewer info */}
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    </div>
                </div>

                {/* Review content */}
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 pt-4">
                    <Skeleton className="h-10 w-24 rounded-md" />
                    <Skeleton className="h-10 w-32 rounded-md" />
                </div>
                </div>
            )
        }
    
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Review History</h1>
                <p className="text-muted-foreground">View all A.I. Code reviews.</p>
            </div>
            {
                reviews?.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No review yet. Connect a repository and open a PR to get AI reviews.</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {reviews?.map((review:any) => (
                            <Card key={review.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-lg">{review.prTitle}</CardTitle>
                                                {review.status === "completed" && (
                                                    <Badge variant="default" className="gap-1">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Completed
                                                    </Badge>
                                                )}
                                                {review.status === "failed" && (
                                                    <Badge variant="default" className="gap-1">
                                                        <XCircle className="h-3 w-3"/>
                                                        Failed
                                                    </Badge>
                                                )}
                                                {review.status === "pending" && (
                                                    <Badge variant="destructive" className="gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Pending
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardDescription>
                                                {review.repository.fullName} * PR * # {review.prNumber}
                                            </CardDescription>
                                        </div>
                                        <Button variant="ghost" size="icon" asChild>
                                            <a href={review.prUrl} target="_blank" rel="noopener noreferrer">
                                             <ExternalLink  className="h-4 w-4"/>
                                            </a>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true})}
                                        </div>
                                    </div>
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <div className="bg-muted p-4 rounded-lg">
                                            <pre className="whitespace-pre-wrap text-xs">{review.review.substring(0, 300)}...</pre>
                                        </div>
                                    </div>
                                    <Button variant={"outline"} asChild>
                                        <a href={review.prUrl} target="_blank" rel="noopener noreferrer">
                                            View Full Review on Github
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )
            }
        </div>
    )

}