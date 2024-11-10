import express from 'express';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get reviews for a book
// Get reviews for a book
router.get('/book/:bookId', async (req, res) => {
  try {
    console.log('Fetching reviews for bookId:', req.params.bookId); // Debugging: Log the bookId
    // Explicitly treat bookId as a string in the query to avoid ObjectId casting issue
    const reviews = await Review.find({ bookId: req.params.bookId }).sort({ createdAt: -1 });
    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this book' });
    }
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
});


// Add a review
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, content, rating } = req.body;
    const review = new Review({
      bookId,
      userId: req.user._id,
      userName: req.user.name,
      content,
      rating,
    });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add review', error: error.message });
  }
});

// Add a comment to a review
router.post('/:reviewId/comments', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const comment = {
      userId: req.user._id,
      userName: req.user.name,
      content: req.body.content,
    };

    review.comments.push(comment);
    await review.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
});

export default router;
