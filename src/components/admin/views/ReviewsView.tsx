import React from 'react';
import { Star, CheckCircle, Trash2 } from 'lucide-react';

export const ReviewsView: React.FC = () => {
  const REVIEWS = [
    { id: 'rev-1', customer: 'Pooja Maharjan', product: 'Amul Taaza Milk', rating: 5, date: 'Today, 10:15 AM', comment: 'Always fresh and delivered in 25 minutes! Best grocery service in Tikathali.' },
    { id: 'rev-2', customer: 'Bipin Adhikari', product: 'Surf Excel 2kg', rating: 5, date: 'Yesterday', comment: 'Original quality and genuine brand packaging. Great price compared to local bhatti.' },
    { id: 'rev-3', customer: 'Anjali Sharma', product: 'Fresh Farm Tomatoes', rating: 4, date: '25 Sep', comment: 'Tomatoes were ripe and fresh, packaging was neat in eco-friendly paper bags.' }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>Customer Product Reviews</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Customer feedback, product ratings, and moderation</p>
        </div>
      </div>

      <div className="space-y-3">
        {REVIEWS.map(r => (
          <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-900 text-sm">{r.customer}</span>
                <span className="text-slate-400 text-xs">• {r.date}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-brand-800 font-semibold mb-2">
                <span>Product: {r.product}</span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic">"{r.comment}"</p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Published</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
