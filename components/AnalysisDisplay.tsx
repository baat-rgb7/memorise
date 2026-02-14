
import React from 'react';
import { RoomAnalysis } from '../types';

interface AnalysisDisplayProps {
  analysis: RoomAnalysis;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="grid md:grid-cols-2 gap-0">
        <div className="h-[400px] md:h-full bg-gray-100">
          <img 
            src={analysis.image} 
            alt="Room to organize" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-8 lg:p-12 space-y-8">
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              {analysis.roomType}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 serif mb-4">AI Analysis Report</h2>
            <p className="text-gray-600 leading-relaxed">{analysis.summary}</p>
          </div>

          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Identified Clutter Points
            </h3>
            <div className="space-y-3">
              {analysis.clutterPoints.map((point, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900">{point.area}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      point.severity === 'high' ? 'bg-red-100 text-red-700' :
                      point.severity === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {point.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{point.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
              Organization Tips
            </h3>
            <ul className="space-y-3">
              {analysis.organizationTips.map((tip, idx) => (
                <li key={idx} className="flex gap-3 text-gray-600">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                  <span className="text-sm leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          {analysis.suggestedProducts.length > 0 && (
            <section className="pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Suggestions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analysis.suggestedProducts.map((product, idx) => (
                  <div key={idx} className="p-4 bg-emerald-50 rounded-xl">
                    <p className="text-sm font-bold text-emerald-800">{product.name}</p>
                    <p className="text-xs text-emerald-700/70 mt-1">{product.reason}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
