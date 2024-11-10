import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MessageSquare, Send } from 'lucide-react';
import StarRating from './StarRating';

interface Review {
  _id: string;
  bookId: string;
  userId: string;
  userName: string;
  content: string;
  rating: number;
  comments: Comment[];
  createdAt: string;
}

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

interface BookReviewsProps {
  bookId: string;
}

export default function BookReviews({ bookId }: BookReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ content: '', rating: 0 });
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/book/${bookId}`);
      setReviews(response.data);
    } catch (error) {
       console.log("hi")
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('User is not authenticated');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/reviews',
        { bookId, ...newReview },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews([response.data, ...reviews]);
      setNewReview({ content: '', rating: 0 });
    } catch (error) {
      console.error(error);
      setError('Failed to add review');
    }
  };

  const handleCommentSubmit = async (reviewId: string) => {
    if (!user || !newComments[reviewId]) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('User is not authenticated');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/reviews/${reviewId}/comments`,
        { content: newComments[reviewId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviews(reviews.map((review) =>
        review._id === reviewId
          ? { ...review, comments: [...review.comments, response.data] }
          : review
      ));
      setNewComments({ ...newComments, [reviewId]: '' });
    } catch (error) {
      console.error(error);
      setError('Failed to add comment');
    }
  };

  if (loading) return <div className="text-center py-4">Loading reviews...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Reviews</h3>

      {user && (
        <form onSubmit={handleReviewSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Rating
            </label>
            <StarRating
              rating={newReview.rating}
              onRate={(rating) => setNewReview({ ...newReview, rating })}
              size="lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Review
            </label>
            <textarea
              value={newReview.content}
              onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              rows={3}
              required
              placeholder="Share your thoughts about this book..."
            />
          </div>
          <button
            type="submit"
            disabled={!newReview.content || newReview.rating === 0}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
          >
            Submit Review
          </button>
        </form>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="p-4 bg-white rounded-lg shadow-md">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{review.userName}</span>
                <StarRating rating={review.rating} size="sm" />
              </div>
              <p className="text-gray-700 mt-2">{review.content}</p>

              <div className="mt-4 space-y-2">
                {review.comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-2">
                    <span className="font-semibold">{comment.userName}:</span>
                    <span>{comment.content}</span>
                  </div>
                ))}
              </div>

              {user && (
                <div className="mt-4 flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComments[review._id] || ''}
                    onChange={(e) => setNewComments({ ...newComments, [review._id]: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 flex-grow"
                  />
                  <button
                    onClick={() => handleCommentSubmit(review._id)}
                    className="bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 transition"
                  >
                    <Send size={20} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
