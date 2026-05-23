const express = require('express');
const { query, usePostgres } = require('../config/database');

const router = express.Router();

// Case-insensitive search operator based on DB type
const likeOperator = usePostgres ? 'ILIKE' : 'LIKE';

// @route   GET /api/products
// @desc    Get all products with search and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search = '', 
      category = '', 
      minPrice = 0, 
      maxPrice = 999999,
      sort = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;

    // Build dynamic query
    let queryText = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = ${usePostgres ? 'true' : '1'}
    `;
    const queryParams = [];
    let paramIndex = 1;

    // Add search filter
    if (search) {
      queryText += ` AND (p.name ${likeOperator} $${paramIndex} OR p.description ${likeOperator} $${paramIndex} OR p.brand ${likeOperator} $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Add category filter
    if (category) {
      queryText += ` AND c.name = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    // Add price range filter
    queryText += ` AND p.price >= $${paramIndex}`;
    queryParams.push(parseFloat(minPrice));
    paramIndex++;

    queryText += ` AND p.price <= $${paramIndex}`;
    queryParams.push(parseFloat(maxPrice));
    paramIndex++;

    // Add sorting
    const allowedSortFields = ['price', 'created_at', 'name', 'rating'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    queryText += ` ORDER BY p.${sortField} ${sortOrder}`;

    // Add pagination
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    // Execute query
    const result = await query(queryText, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = ${usePostgres ? 'true' : '1'}
    `;
    const countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (p.name ${likeOperator} $${countParamIndex} OR p.description ${likeOperator} $${countParamIndex} OR p.brand ${likeOperator} $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (category) {
      countQuery += ` AND c.name = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }

    countQuery += ` AND p.price >= $${countParamIndex}`;
    countParams.push(parseFloat(minPrice));
    countParamIndex++;

    countQuery += ` AND p.price <= $${countParamIndex}`;
    countParams.push(parseFloat(maxPrice));

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Parse specifications and images arrays for SQLite compatibility
    const products = result.rows.map(prod => {
      let specs = prod.specifications;
      if (typeof specs === 'string') {
        try { specs = JSON.parse(specs); } catch (e) { specs = {}; }
      }
      
      let imgs = prod.images;
      if (typeof imgs === 'string') {
        try { imgs = JSON.parse(imgs); } catch (e) { imgs = []; }
      } else if (usePostgres && Array.isArray(imgs)) {
        imgs = prod.images; // PG array is already array
      } else if (!imgs) {
        imgs = [prod.image_url];
      }
      
      return {
        ...prod,
        specifications: specs,
        images: imgs
      };
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 AND p.is_active = ${usePostgres ? 'true' : '1'}`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const prod = result.rows[0];
    
    // Parse specifications and images array
    let specs = prod.specifications;
    if (typeof specs === 'string') {
      try { specs = JSON.parse(specs); } catch (e) { specs = {}; }
    }
    
    let imgs = prod.images;
    if (typeof imgs === 'string') {
      try { imgs = JSON.parse(imgs); } catch (e) { imgs = []; }
    } else if (usePostgres && Array.isArray(imgs)) {
      imgs = prod.images;
    } else if (!imgs) {
      imgs = [prod.image_url];
    }

    res.json({
      success: true,
      data: {
        product: {
          ...prod,
          specifications: specs,
          images: imgs
        },
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
    });
  }
});

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE c.name = $1 AND p.is_active = ${usePostgres ? 'true' : '1'}
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
      [category, limit, offset]
    );

    const products = result.rows.map(prod => {
      let specs = prod.specifications;
      if (typeof specs === 'string') {
        try { specs = JSON.parse(specs); } catch (e) { specs = {}; }
      }
      
      let imgs = prod.images;
      if (typeof imgs === 'string') {
        try { imgs = JSON.parse(imgs); } catch (e) { imgs = []; }
      } else if (usePostgres && Array.isArray(imgs)) {
        imgs = prod.images;
      } else if (!imgs) {
        imgs = [prod.image_url];
      }
      
      return {
        ...prod,
        specifications: specs,
        images: imgs
      };
    });

    res.json({
      success: true,
      data: {
        products,
      },
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
    });
  }
});

module.exports = router;
