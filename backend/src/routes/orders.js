const express = require('express');
const { query, pool, usePostgres } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

// Helper to parse order shipping address JSON
const parseOrderAddress = (order) => {
  if (!order) return null;
  let address = order.shipping_address;
  if (typeof address === 'string') {
    try {
      address = JSON.parse(address);
    } catch (e) {
      address = {};
    }
  }
  return {
    ...order,
    shipping_address: address
  };
};

// @route   POST /api/orders
// @desc    Create new order from cart
// @access  Private
router.post('/', async (req, res) => {
  const client = await pool.connect();
  const isActiveVal = usePostgres ? 'true' : '1';
  
  try {
    const { shippingAddress, paymentMethod = 'Cash on Delivery' } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || 
        !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.phone) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required',
      });
    }

    await client.query('BEGIN');

    // Get cart items
    const cartResult = await client.query(
      `SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        p.id as product_id,
        p.name,
        p.price,
        p.image_url,
        p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1 AND p.is_active = ${isActiveVal}`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    const cartItems = cartResult.rows;

    // Check stock availability
    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}`,
        });
      }
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (parseFloat(item.price) * item.quantity),
      0
    );

    // Create order
    const orderNumber = generateOrderNumber();
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, order_number, total_amount, shipping_address, payment_method, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, orderNumber, totalAmount, JSON.stringify(shippingAddress), paymentMethod, 'confirmed']
    );

    const order = orderResult.rows[0];

    // Create order items and update stock
    for (const item of cartItems) {
      // Insert order item
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, product_name, product_image)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id, item.quantity, item.price, item.name, item.image_url]
      );

      // Update product stock
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await client.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [req.user.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order: {
          id: order.id,
          orderNumber: order.order_number,
          totalAmount: parseFloat(order.total_amount),
          status: order.status,
          createdAt: order.created_at,
        },
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while placing order',
    });
  } finally {
    client.release();
  }
});

// @route   GET /api/orders
// @desc    Get user's order history
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.payment_method,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id, o.order_number, o.total_amount, o.status, o.shipping_address, o.payment_method, o.created_at, o.updated_at
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].total);

    const orders = result.rows.map(parseOrderAddress);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order with items
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get order
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const order = parseOrderAddress(orderResult.rows[0]);

    // Get order items
    const itemsResult = await query(
      `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at`,
      [id]
    );

    res.json({
      success: true,
      data: {
        order: {
          ...order,
          items: itemsResult.rows,
        },
      },
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order',
    });
  }
});

// @route   GET /api/orders/number/:orderNumber
// @desc    Get order by order number
// @access  Private
router.get('/number/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    // Get order
    const orderResult = await query(
      'SELECT * FROM orders WHERE order_number = $1 AND user_id = $2',
      [orderNumber, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const order = parseOrderAddress(orderResult.rows[0]);

    // Get order items
    const itemsResult = await query(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at',
      [order.id]
    );

    res.json({
      success: true,
      data: {
        order: {
          ...order,
          items: itemsResult.rows,
        },
      },
    });
  } catch (error) {
    console.error('Get order by number error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order',
    });
  }
});

module.exports = router;
