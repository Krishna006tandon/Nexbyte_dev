const express = require('express');
const router = express.Router();
const InternshipListing = require('../models/InternshipListing');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Get all active internship listings
router.get('/listings', async (req, res) => {
  try {
    const { category, mode, search } = req.query;
    
    let filter = { isActive: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (mode && mode !== 'all') {
      filter.mode = mode;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const listings = await InternshipListing.find(filter)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    console.error('Error fetching internship listings:', error);
    res.status(500).json({ error: 'Failed to fetch internship listings' });
  }
});

// Get single internship listing
router.get('/listings/:id', async (req, res) => {
  try {
    const listing = await InternshipListing.findById(req.params.id)
      .populate('postedBy', 'name email');
    
    if (!listing) {
      return res.status(404).json({ error: 'Internship listing not found' });
    }

    res.json(listing);
  } catch (error) {
    console.error('Error fetching internship listing:', error);
    res.status(500).json({ error: 'Failed to fetch internship listing' });
  }
});

// Create new internship listing (Admin only)
router.post('/listings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const listingData = {
      ...req.body,
      postedBy: req.user._id
    };

    const listing = new InternshipListing(listingData);
    await listing.save();

    const populatedListing = await InternshipListing.findById(listing._id)
      .populate('postedBy', 'name email');

    res.status(201).json(populatedListing);
  } catch (error) {
    console.error('Error creating internship listing:', error);
    res.status(500).json({ error: 'Failed to create internship listing' });
  }
});

// Update internship listing (Admin only)
router.put('/listings/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const listing = await InternshipListing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    if (!listing) {
      return res.status(404).json({ error: 'Internship listing not found' });
    }

    res.json(listing);
  } catch (error) {
    console.error('Error updating internship listing:', error);
    res.status(500).json({ error: 'Failed to update internship listing' });
  }
});

// Delete internship listing (Admin only)
router.delete('/listings/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const listing = await InternshipListing.findByIdAndDelete(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Internship listing not found' });
    }

    res.json({ message: 'Internship listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting internship listing:', error);
    res.status(500).json({ error: 'Failed to delete internship listing' });
  }
});

// Get application statistics (Admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const stats = await InternshipListing.aggregate([
      {
        $group: {
          _id: null,
          totalListings: { $sum: 1 },
          activeListings: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalApplicants: { $sum: '$currentApplicants' },
          categories: { $addToSet: '$category' }
        }
      }
    ]);

    const categoryStats = await InternshipListing.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalApplicants: { $sum: '$currentApplicants' }
        }
      }
    ]);

    res.json({
      overview: stats[0] || { totalListings: 0, activeListings: 0, totalApplicants: 0 },
      categoryStats
    });
  } catch (error) {
    console.error('Error fetching internship stats:', error);
    res.status(500).json({ error: 'Failed to fetch internship statistics' });
  }
});

module.exports = router;
