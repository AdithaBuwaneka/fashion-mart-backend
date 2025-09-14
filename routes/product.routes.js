const express = require('express');
const router = express.Router();
const db = require('../models');
const Product = db.product;
const Category = db.category;
const Stock = db.stock;
const Design = db.design;
const User = db.user;
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with filtering and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of products per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter products that are in stock
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Get all products (public endpoint)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      sizes,
      colors,
      inStock,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { active: true };

    // Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Category filter
    if (category) {
      where.categoryId = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    // Size and color filters would need to be handled in stock table
    let stockWhere = {};
    if (sizes) {
      const sizeArray = sizes.split(',');
      stockWhere.size = { [Op.in]: sizeArray };
    }
    if (colors) {
      const colorArray = colors.split(',');
      stockWhere.color = { [Op.in]: colorArray };
    }
    if (inStock === 'true') {
      stockWhere.quantity = { [Op.gt]: 0 };
    }

    const include = [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'description']
      },
      {
        model: User,
        as: 'designer',
        attributes: ['id', 'firstName', 'lastName']
      },
      {
        model: Stock,
        as: 'stocks',
        where: Object.keys(stockWhere).length > 0 ? stockWhere : undefined,
        required: Object.keys(stockWhere).length > 0
      }
    ];

    const order = [[sortBy, sortOrder.toUpperCase()]];

    const products = await Product.findAndCountAll({
      where,
      include,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    res.status(200).json({
      success: true,
      data: {
        products: products.rows,
        total: products.count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message
    });
  }
});

// Get featured products (public endpoint) - MUST be before /:productId
router.get('/featured', async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    const products = await Product.findAll({
      where: { active: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'designer',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Stock,
          as: 'stocks',
          where: { quantity: { [Op.gt]: 0 } },
          required: true
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error getting featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured products',
      error: error.message
    });
  }
});

// Get product availability (public endpoint) - MUST be before /:productId
router.get('/:productId/availability', async (req, res) => {
  try {
    const { productId } = req.params;

    const stocks = await Stock.findAll({
      where: { productId }
    });

    if (stocks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Group stock by size and color
    const stockMap = {};
    let hasAvailableStock = false;

    stocks.forEach(stock => {
      if (!stockMap[stock.size]) {
        stockMap[stock.size] = {};
      }
      stockMap[stock.size][stock.color] = stock.quantity;
      if (stock.quantity > 0) {
        hasAvailableStock = true;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        available: hasAvailableStock,
        stock: stockMap
      }
    });
  } catch (error) {
    console.error('Error getting product availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product availability',
      error: error.message
    });
  }
});

// Get related products (public endpoint) - MUST be before /:productId
router.get('/:productId/related', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    // Get the current product to find similar ones
    const currentProduct = await Product.findByPk(productId);
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const relatedProducts = await Product.findAll({
      where: {
        active: true,
        categoryId: currentProduct.categoryId,
        id: { [Op.ne]: productId }
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'designer',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Stock,
          as: 'stocks',
          where: { quantity: { [Op.gt]: 0 } },
          required: true
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: relatedProducts
    });
  } catch (error) {
    console.error('Error getting related products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get related products',
      error: error.message
    });
  }
});

// Get product by ID (public endpoint) - MUST be after all specific routes
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId, {
      where: { active: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'designer',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Stock,
          as: 'stocks'
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error.message
    });
  }
});

module.exports = router;