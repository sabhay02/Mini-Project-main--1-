import express from 'express';
import Scheme from '../models/Scheme.js';
import { sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

// GET /api/schemes?status=active&page=1&limit=10&category=...&q=...
router.get('/', sanitizeInput, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    // default to active
    if (req.query.status) query.status = req.query.status;
    else query.status = 'active';

    if (req.query.category) query.category = req.query.category;
    if (req.query.department) query.department = req.query.department;
    if (req.query.level) query.level = req.query.level;

    if (req.query.q) {
      const q = req.query.q.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { nameHindi: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { descriptionHindi: { $regex: q, $options: 'i' } }
      ];
    }

    const schemes = await Scheme.find(query)
      .sort({ featured: -1, priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Scheme.countDocuments(query);

    res.json({
      success: true,
      data: {
        schemes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Public get schemes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schemes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/schemes/:id
router.get('/:id', sanitizeInput, async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id).lean();
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
    res.json({ success: true, data: { scheme } });
  } catch (error) {
    console.error('Public get scheme error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheme',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;