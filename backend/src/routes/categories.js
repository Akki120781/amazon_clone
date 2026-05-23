const express = require('express');
const { query, usePostgres } = require('../config/database');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories with their product count
// @access  Public
router.get('/', async (req, res) => {
  try {
    const isActiveVal = usePostgres ? 'true' : '1';
    
    // SQLite and Postgres-compatible group by query
    const result = await query(
      `SELECT 
        c.id,
        c.name,
        c.description,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = ${isActiveVal}
      GROUP BY c.id, c.name, c.description
      ORDER BY c.name ASC`
    );

    res.json({
      success: true,
      data: {
        categories: result.rows,
      },
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      data: {
        category: result.rows[0],
      },
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category',
    });
  }
});

module.exports = router;
