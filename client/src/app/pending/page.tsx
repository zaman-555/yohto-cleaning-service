import React from 'react';
import Link from 'next/link';

export default function PendingApproval() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30 font-sans">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-10 text-center backdrop-blur-sm relative overflow-hidden">
        
        {/* Animated background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="relative z-10">
          <div className="mx-auto w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mb-6 border border-neutral-700 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Pending Approval
          </h1>
          
          <p className="text-neutral-400 mb-8 leading-relaxed text-lg">
            Your account has been created successfully, but it requires administrator approval before you can access the dashboard.
          </p>

          <div className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-4 mb-8">
            <p className="text-sm text-neutral-500">
              We will notify you once your account is reviewed. Please check back later.
            </p>
          </div>
          
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center px-6 py-3 border border-neutral-700 rounded-lg text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
