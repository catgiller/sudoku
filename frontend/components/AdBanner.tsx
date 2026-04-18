import React from 'react';
import { Cloud, Sparkles } from 'lucide-react';

interface AdBannerProps {
    type: 'vertex' | 'gcp';
}

export const AdBanner: React.FC<AdBannerProps> = ({ type }) => {
    if (type === 'vertex') {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center text-center hover:border-brand-500/50 transition-all cursor-pointer group relative overflow-hidden h-[480px] w-full shadow-xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600 opacity-80 z-10"></div>
                
                {/* Image Section */}
                <div className="w-full h-48 relative overflow-hidden bg-slate-800">
                    <img 
                        src="https://picsum.photos/seed/ai-tech/400/300" 
                        alt="Vertex AI" 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col items-center flex-1 w-full">
                    <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 -mt-12 relative z-10 border border-slate-800 bg-slate-900">
                        <Sparkles className="text-brand-400" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-100 mt-4">Vertex AI</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mt-3 flex-1">
                        Build, deploy, and scale generative AI models faster than ever with Google's unified AI platform.
                    </p>
                    <button className="mt-4 px-4 py-3 bg-slate-800 hover:bg-brand-600 text-brand-400 hover:text-black text-sm font-bold rounded-xl w-full transition-colors border border-slate-700 hover:border-brand-500">
                        Try it Free
                    </button>
                    <span className="text-[10px] text-slate-600 uppercase tracking-widest mt-4 font-semibold">Advertisement</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center text-center hover:border-brand-500/50 transition-all cursor-pointer group relative overflow-hidden h-[480px] w-full shadow-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 to-brand-400 opacity-80 z-10"></div>
            
            {/* Image Section */}
            <div className="w-full h-48 relative overflow-hidden bg-slate-800">
                <img 
                    src="https://picsum.photos/seed/cloud-computing/400/300" 
                    alt="Google Cloud" 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col items-center flex-1 w-full">
                <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 -mt-12 relative z-10 border border-slate-800 bg-slate-900">
                    <Cloud className="text-brand-400" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mt-4">Google Cloud</h3>
                <p className="text-sm text-slate-400 leading-relaxed mt-3 flex-1">
                    Accelerate your transformation and scale globally with the best of Google's secure infrastructure.
                </p>
                <button className="mt-4 px-4 py-3 bg-slate-800 hover:bg-brand-600 text-brand-400 hover:text-black text-sm font-bold rounded-xl w-full transition-colors border border-slate-700 hover:border-brand-500">
                    Start Building
                </button>
                <span className="text-[10px] text-slate-600 uppercase tracking-widest mt-4 font-semibold">Advertisement</span>
            </div>
        </div>
    );
};
