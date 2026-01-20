import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Skeleton para o Hero Section
export const HeroSkeleton: React.FC = () => (
  <div className="relative py-12 sm:py-16 lg:py-20 px-4">
    <div className="container mx-auto">
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Badge */}
        <Skeleton className="h-6 w-40 rounded-full" />
        
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-80 mx-auto" />
          <Skeleton className="h-10 w-64 mx-auto" />
        </div>
        
        {/* Subtitle */}
        <Skeleton className="h-5 w-96 max-w-full" />
        
        {/* Search bar */}
        <Skeleton className="h-14 w-full max-w-xl rounded-xl" />
        
        {/* Trending tags */}
        <div className="flex flex-wrap justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        
        {/* Stats */}
        <div className="flex gap-8 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-8 w-16 mx-auto" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Skeleton para cards de ofertas
export const OfferCardSkeleton: React.FC = () => (
  <Card className="overflow-hidden">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>
      
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </CardContent>
  </Card>
);

// Skeleton para seção de ofertas diárias
export const DailyOffersSkeleton: React.FC = () => (
  <div className="container mx-auto py-8 px-4 sm:px-6">
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-9 w-28 rounded-lg" />
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <OfferCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Skeleton para ranking regional
export const RankingSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
    
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Skeleton para resumo da conta
export const AccountSummarySkeleton: React.FC = () => (
  <Card className="overflow-hidden">
    <CardContent className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Info do Plano */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Skeleton para seção "Por que usar"
export const WhyUseSkeleton: React.FC = () => (
  <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 sm:p-8 rounded-2xl border border-border/50">
    <div className="text-center mb-8 space-y-2">
      <Skeleton className="h-7 w-64 mx-auto" />
      <Skeleton className="h-4 w-80 mx-auto" />
    </div>
    
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/30">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>
    
    <div className="mt-6 text-center">
      <Skeleton className="h-10 w-44 mx-auto rounded-md" />
    </div>
  </div>
);

// Container de loading para a página toda
export const HomePageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-app-gray dark:bg-gray-900 animate-pulse">
    {/* Navbar Skeleton */}
    <div className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="hidden md:flex items-center gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>
    </div>
    
    {/* Hero Skeleton */}
    <HeroSkeleton />
    
    {/* Daily Offers Skeleton */}
    <DailyOffersSkeleton />
    
    {/* Ranking Skeleton */}
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <RankingSkeleton />
    </div>
    
    {/* Account Summary Skeleton */}
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <AccountSummarySkeleton />
    </div>
    
    {/* Why Use Skeleton */}
    <div className="container mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <WhyUseSkeleton />
    </div>
  </div>
);

export default HomePageSkeleton;
