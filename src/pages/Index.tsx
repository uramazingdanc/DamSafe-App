
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-dam-dark text-white overflow-hidden">
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Background gradients */}
        <div className="absolute top-40 -left-24 w-72 h-72 bg-dam-blue/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 -right-24 w-80 h-80 bg-dam-blue/10 rounded-full filter blur-3xl opacity-40"></div>
        
        <div className="relative z-10 w-full max-w-md mx-auto text-center">
          <div className="mb-10 flex justify-center">
            <Logo size="large" isAnimated={true} />
          </div>
          
          <div className="animate-fade-up animate-delay-200">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
              Dam Stability Assessment
            </h1>
            
            <p className="text-white/70 mb-8 leading-relaxed">
              Calculate and analyze critical stability factors for different dam structures with precision and ease.
            </p>
            
            <button
              onClick={() => navigate('/calculator')}
              className="w-full bg-dam-blue hover:bg-dam-blue/90 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-dam-blue/20"
            >
              Start Assessment
            </button>
            
            <div className="mt-8 grid grid-cols-3 gap-4">
              {['Sliding Safety', 'Overturning', 'Structural Analysis'].map((feature, index) => (
                <div 
                  key={feature}
                  className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 animate-fade-up`}
                  style={{ animationDelay: `${(index + 4) * 0.1}s` }}
                >
                  <p className="text-white/80 text-sm">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <footer className="text-center py-4 px-6 text-white/40 text-xs border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <p>DamSafe • Professional Dam Safety Assessment</p>
      </footer>
    </div>
  );
};

export default Index;
