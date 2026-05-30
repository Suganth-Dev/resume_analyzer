import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  BrainCircuit, 
  FileText, 
  Search, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck 
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 flex flex-col relative overflow-hidden font-sans">
      {/* Background spotlights */}
      <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-glow-spot rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-glow-spot rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 h-20 border-b border-dark-800/40 px-6 lg:px-16 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-brand-400" />
          <span className="text-xl font-bold tracking-tight text-white">
            Sugan Resume <span className="text-gradient">Analyzer</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className="px-5 py-2.5 rounded-lg bg-gradient-brand hover:brightness-110 font-semibold text-sm text-white transition-all shadow-lg shadow-brand-500/20"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-dark-300 hover:text-white font-medium text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 rounded-lg bg-gradient-brand hover:brightness-110 font-semibold text-sm text-white transition-all shadow-lg shadow-brand-500/20"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-16 py-16 lg:py-28 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/40 border border-brand-800/40 text-brand-300 text-xs font-semibold mb-6 animate-pulse-slow">
          <Zap className="w-3.5 h-3.5" /> Optimize Resumes for ATS Scanners Instantly
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
          Get Hired with our <br />
          <span className="text-gradient">AI Resume Analyzer</span>
        </h1>
        
        <p className="max-w-2xl text-dark-300 text-base md:text-lg mb-10 leading-relaxed">
          Upload your resume PDF, match it against target job roles, calculate your ATS optimization score, map technical skill gaps, and download professional audit reports instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16 justify-center w-full max-w-md">
          <Link
            to={isAuthenticated ? "/analyzer" : "/register"}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-brand font-semibold text-white transition-all shadow-lg shadow-brand-500/25 hover:brightness-110"
          >
            Start Analysis Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="flex-1 flex items-center justify-center px-8 py-4 rounded-xl bg-dark-900/60 hover:bg-dark-800/80 border border-dark-800 font-semibold text-dark-200 transition-all"
          >
            Learn More
          </a>
        </div>

        {/* Feature Highlights Grid */}
        <section id="features" className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-left pt-16 border-t border-dark-800/40">
          <div className="glass-card p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-brand-950/60 border border-brand-800/50 flex items-center justify-center mb-6">
              <Search className="w-6 h-6 text-brand-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">ATS Skill Gap Mapping</h3>
            <p className="text-sm text-dark-400 leading-relaxed">
              We extract text from your PDF resume and compare it directly against core skill requirements to isolate missing competencies.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-brand-950/60 border border-brand-800/50 flex items-center justify-center mb-6">
              <CheckCircle className="6 h-6 text-brand-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Multi-Metric Scoring</h3>
            <p className="text-sm text-dark-400 leading-relaxed">
              Get an overall optimization rating compiled from education indicators, format quality, keyword density, and project action verbs.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-brand-950/60 border border-brand-800/50 flex items-center justify-center mb-6">
              <FileText className="w-6 h-6 text-brand-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Downloadable Reports</h3>
            <p className="text-sm text-dark-400 leading-relaxed">
              Export professional, detailed PDF summaries covering suggestions, matched keywords, and gap matrices with a single click.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-dark-800/40 py-8 px-6 text-center text-xs text-dark-500 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-brand-400" />
            <span className="font-semibold text-white">Sugan Resume Analyzer</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-1 text-dark-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Secure Data Encryption
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
