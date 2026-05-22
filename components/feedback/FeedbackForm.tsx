'use client';

import { useState } from "react";
import Link from "next/link";
import { Star, Send, ThumbsUp, Loader2 } from "lucide-react";
import posthog from "posthog-js";

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  if (submitted) {
    return (
      <div className="w-full max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ThumbsUp className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
        <p className="text-gray-500 mb-6">We appreciate your feedback.</p>
        <Link
          href="/tutorials"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--astar-red)] text-white font-semibold rounded-full shadow-lg shadow-red-500/20 hover:-translate-y-0.5 transition-all text-sm"
        >
          Browse Tutorials
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">How was your session?</h1>
      </div>

      <form className="flex flex-col gap-8" onSubmit={async (e) => {
        e.preventDefault();
        if (!rating) { setError("Please select a rating before submitting."); return; }
        setError(null);
        setLoading(true);
        try {
          const res = await fetch("/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rating, comment }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error ?? "Something went wrong. Please try again.");
          } else {
            posthog.capture("feedback_submitted", {
              rating,
              has_comment: comment.trim().length > 0,
            });
            setSubmitted(true);
          }
        } catch (err) {
          posthog.captureException(err);
          setError("Something went wrong. Please try again.");
        } finally {
          setLoading(false);
        }
      }}>
        
        {/* Rating Section */}
        <div className="flex flex-col items-center gap-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rate your experience</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-105 active:scale-95"
              >
                <Star 
                  size={42} 
                  strokeWidth={1.5}
                  className={`${
                    star <= (hoverRating || rating) 
                      ? 'fill-[var(--astar-red)] text-[var(--astar-red)]' 
                      : 'fill-transparent text-gray-300'
                  } transition-colors duration-200`} 
                />
              </button>
            ))}
          </div>
          <p className="text-sm font-semibold text-[var(--astar-red)] h-5 text-center">
            {hoverRating === 5 ? "Excellent!" : (hoverRating === 4 ? "Very Good" : (hoverRating === 3 ? "Average" : (hoverRating === 2 ? "Poor" : (hoverRating === 1 ? "Very Poor" : ""))))}
          </p>
        </div>

        {/* Comment Section */}
        <div className="space-y-3">
          <textarea
            rows={4}
            placeholder="Share your thoughts on the session..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-xl focus:ring-0 focus:outline-none text-lg placeholder:text-gray-400 text-gray-800 resize-none transition-colors"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center -mt-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary bg-[var(--astar-red)] text-white font-bold text-lg py-4 rounded-full shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Submitting…</>
          ) : (
            <>Submit Feedback <Send size={18} /></>
          )}
        </button>
      </form>
    </div>
  );
}
