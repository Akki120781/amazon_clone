const express = require('express');
const { query, usePostgres } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', async (req, res) => {
  try {
    const isActiveVal = usePostgres ? 'true' : '1';
    const result = await query(
      `SELECT 
        ci.id,
        ci.quantity,
        ci.created_at,
        p.id as product_id,
        p.name,
        p.price,
        p.image_url,
        p.stock_quantity,
        (ci.quantity * p.price) as subtotal
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1 AND p.is_active = ${isActiveVal}
      ORDER BY ci.created_at DESC`,
      [req.user.id]
    );

    // Calculate totals
    const items = result.rows;
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    res.json({
      success: true,
      data: {
        items,
        summary: {
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
        },
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
    });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const isActiveVal = usePostgres ? 'true' : '1';

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    // Check if product exists and has stock
    const productResult = await query(
      `SELECT id, name, stock_quantity FROM products WHERE id = $1 AND is_active = ${isActiveVal}`,
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive',
      });
    }

    const product = productResult.rows[0];

    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
    }

    // Check if item already in cart
    const existingItem = await query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    let result;

    if (existingItem.rows.length > 0) {
      // Update quantity
      const newQuantity = existingItem.rows[0].quantity + quantity;

      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock for requested quantity',
        });
      }

      result = await query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
        [newQuantity, existingItem.rows[0].id]
      );
    } else {
      // Add new item
      result = await query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [req.user.id, productId, quantity]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: {
        cartItem: result.rows[0],
      },
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart',
    });
  }
});

// @route   PUT /api/cart/:id
// @desc    Update cart item quantity
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    // Get cart item
    const cartItem = await query(
      `SELECT ci.*, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = $1 AND ci.user_id = $2`,
      [id, req.user.id]
    );

    if (cartItem.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    if (cartItem.rows[0].stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
      });
    }

    // Update quantity
    const result = await query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );

    res.json({
      success: true,
      message: 'Cart item updated',
      data: {
        cartItem: result.rows[0],
      },
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart',
    });
  }
});

// @route   DELETE /api/cart/:id
// @desc    Remove item from cart
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from cart',
    });
  }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', async (req, res) => {
  try {
    await query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart',
    });
  }
});

module.exports = router;
