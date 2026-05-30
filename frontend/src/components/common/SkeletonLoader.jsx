import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-card p-6 rounded-2xl animate-pulse flex flex-col gap-3">
    <div className="h-4 bg-dark-800 rounded-md w-1/3"></div>
    <div className="h-8 bg-dark-800 rounded-md w-2/3"></div>
    <div className="h-3 bg-dark-800 rounded-md w-1/2"></div>
  </div>
);

export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="glass-panel rounded-2xl p-6 border border-dark-800/80 animate-pulse">
    <div className="h-8 bg-dark-800 rounded-md w-1/4 mb-6"></div>
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between py-3 border-b border-dark-800/50">
          <div className="h-5 bg-dark-800 rounded-md w-1/3"></div>
          <div className="h-5 bg-dark-800 rounded-md w-1/6"></div>
          <div className="h-5 bg-dark-800 rounded-md w-12"></div>
          <div className="h-8 bg-dark-800 rounded-md w-24"></div>
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass-card p-6 rounded-2xl animate-pulse min-h-[300px] flex flex-col justify-between">
    <div className="h-5 bg-dark-800 rounded-md w-1/4 mb-4"></div>
    <div className="flex-1 bg-dark-800/30 rounded-xl w-full"></div>
  </div>
);

export const AnalysisDetailSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
      <div className="space-y-2 w-full md:w-1/3">
        <div className="h-8 bg-dark-800 rounded-md w-3/4"></div>
        <div className="h-4 bg-dark-800 rounded-md w-1/2"></div>
      </div>
      <div className="h-10 bg-dark-800 rounded-lg w-32"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="glass-card p-8 rounded-2xl h-[300px] bg-dark-800/30"></div>
      <div className="glass-card p-8 rounded-2xl h-[300px] bg-dark-800/30"></div>
    </div>

    <div className="glass-card p-8 rounded-2xl h-[400px] bg-dark-800/30"></div>
  </div>
);
