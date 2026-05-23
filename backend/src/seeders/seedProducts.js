const { query, usePostgres } = require('../config/database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create demo user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const insertUserQuery = `
      INSERT INTO users (email, password, first_name, last_name, phone) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (email) DO NOTHING
    `;
    await query(insertUserQuery, ['demo@amazon.com', hashedPassword, 'Demo', 'User', '+1234567890']);
    console.log('✅ Demo user created (email: demo@amazon.com, password: password123)');

    // Insert categories
    const categories = [
      { name: 'Electronics', description: 'Electronic devices, gadgets, and smart accessories' },
      { name: 'Books', description: 'Bestselling novels, technical resources, and self-help literature' },
      { name: 'Clothing', description: 'Trendy fashion wear, sportswear, and casual apparel' },
      { name: 'Home & Kitchen', description: 'Home appliances, cookware, and decorative kitchen items' },
      { name: 'Sports & Outdoors', description: 'Exercise gear, yoga equipment, and outdoor recreational accessories' },
      { name: 'Toys & Games', description: 'Interactive toys, building sets, and fun board games' },
    ];

    for (const category of categories) {
      await query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [category.name, category.description]
      );
    }
    console.log('✅ Categories inserted');

    // Get category IDs
    const categoriesResult = await query('SELECT id, name FROM categories');
    const categoryMap = {};
    categoriesResult.rows.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // Curated products list with exactly 10 products per category (60 products total)
    const products = [
      // ==========================================
      // ELECTRONICS (10 Products)
      // ==========================================
      {
        name: 'Apple iPhone 15 Pro Max (256GB, Natural Titanium)',
        description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
        price: 1199.99,
        category_id: categoryMap['Electronics'],
        stock_quantity: 50,
        image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
        images: [
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
          'https://images.unsplash.com/photo-1695048133635-7a8c5d38a8d8?w=500'
        ],
        brand: 'Apple',
        rating: 4.8,
        reviews_count: 2547,
        specifications: { 'Display': '6.7-inch OLED XDR', 'Chip': 'A17 Pro', 'Storage': '256GB', 'Camera': '48MP Triple Camera' }
      },
      {
        name: 'Samsung Galaxy S24 Ultra (512GB, Titanium Black)',
        description: 'Meet the smartphone with a built-in S Pen, a 200MP camera, and next-generation built-in Galaxy AI features for editing, translates, and searches.',
        price: 1299.99,
        category_id: categoryMap['Electronics'],
        stock_quantity: 35,
        image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'],
        brand: 'Samsung',
        rating: 4.7,
        reviews_count: 1823,
        specifications: { 'Display': '6.8-inch AMOLED 2X', 'Processor': 'Snapdragon 8 Gen 3', 'Storage': '512GB', 'RAM': '12GB' }
      },
      {
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        description: 'Industry-leading noise canceling headphones with dual-processor ANC, crystal-clear hands-free calling, and smart feature controls.',
        price: 399.00,
        category_id: categoryMap['Electronics'],
        stock_quantity: 120,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
        brand: 'Sony',
        rating: 4.9,
        reviews_count: 4521,
        specifications: { 'Battery Life': 'Up to 30 Hours', 'ANC': 'Yes', 'Bluetooth': '5.2', 'Weight': '250g' }
      },
      {
        name: 'Apple MacBook Pro 14-inch (M3 Chip, 8GB RAM, 512GB SSD)',
        description: 'The standard-setting professional laptop with a gorgeous Liquid Retina XDR screen, M3 silicon speed, and extreme battery efficiency.',
        price: 1599.00,
        category_id: categoryMap['Electronics'],
        stock_quantity: 25,
        image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
        brand: 'Apple',
        rating: 4.9,
        reviews_count: 987,
        specifications: { 'Processor': 'M3 chip (8-Core CPU)', 'RAM': '8GB', 'Storage': '512GB SSD', 'Display': '14.2-inch XDR' }
      },
      {
        name: 'Logitech MX Master 3S Ergonomic Wireless Mouse',
        description: 'Ergonomic performance mouse with an 8K DPI track-on-glass sensor and ultra-quiet click switches.',
        price: 99.99,
        category_id: categoryMap['Electronics'],
        stock_quantity: 150,
        image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500',
        images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500'],
        brand: 'Logitech',
        rating: 4.8,
        reviews_count: 3201,
        specifications: { 'Sensor': 'Darkfield 8000 DPI', 'Connectivity': 'Bluetooth / Bolt', 'Battery': 'Rechargeable Li-Po' }
      },
      {
        name: 'Kindle Paperwhite (16 GB, 6.8" Screen with Adjustable Warm Light)',
        description: 'Purpose-built for reading. Glare-free paper-like display, up to 10 weeks battery life, and 20% faster page turns.',
        price: 149.99,
        category_id: categoryMap['Electronics'],
        stock_quantity: 75,
        image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'],
        brand: 'Amazon',
        rating: 4.7,
        reviews_count: 6710,
        specifications: { 'Screen Size': '6.8 inches', 'Storage': '16GB', 'Waterproof': 'IPX8 rated', 'Charging': 'USB-C' }
      },
      {
        name: 'Apple Watch Series 9 GPS (45mm, Starlight Aluminum)',
        description: 'Your essential companion for a healthy life is now even more powerful. The S9 chip enables a superbright display and a magical double tap gesture.',
        price: 429.00,
        category_id: categoryMap['Electronics'],
        stock_quantity: 40,
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
        brand: 'Apple',
        rating: 4.8,
        reviews_count: 1420,
        specifications: { 'Case Size': '45mm', 'Sensor': 'ECG, SpO2, Temperature', 'Battery': '18 Hours', 'Water Resistance': '50m WR' }
      },
      {
        name: 'JBL Flip 6 Waterproof Portable Bluetooth Speaker',
        description: 'Louder, more powerful sound with a 2-way speaker system. IP67 waterproof and dustproof design with 12 hours of playtime.',
        price: 129.95,
        category_id: categoryMap['Electronics'],
        stock_quantity: 90,
        image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
        images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500'],
        brand: 'JBL',
        rating: 4.6,
        reviews_count: 2450,
        specifications: { 'Output': '20W RMS', 'Water Resistance': 'IP67 Waterproof', 'Playtime': '12 Hours', 'Weight': '550g' }
      },
      {
        name: 'Anker Nano 3 USB-C Fast Charger (30W, PPS Supported)',
        description: 'Incredibly tiny, ultra-compact 30W USB-C wall charger with upgraded safety features to charge iPhones and iPads at top speed.',
        price: 22.99,
        category_id: categoryMap['Electronics'],
        stock_quantity: 300,
        image_url: 'https://images.unsplash.com/photo-1619472381416-202513f51982?w=500',
        images: ['https://images.unsplash.com/photo-1619472381416-202513f51982?w=500'],
        brand: 'Anker',
        rating: 4.8,
        reviews_count: 5120,
        specifications: { 'Output Port': 'USB-C', 'Wattage': '30W Max', 'Dimensions': '1.1 x 1.1 x 1.4 in', 'Color': 'White' }
      },
      {
        name: 'Canon EOS R50 Content Creator Mirrorless Camera',
        description: 'Compact mirrorless camera designed for content creators. Features a 24.2MP CMOS sensor, 4K video recording, and dual pixel autofocus.',
        price: 799.00,
        category_id: categoryMap['Electronics'],
        stock_quantity: 15,
        image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500'],
        brand: 'Canon',
        rating: 4.5,
        reviews_count: 310,
        specifications: { 'Sensor': '24.2 MP APS-C', 'Video': '4K 30p | Full HD 120p', 'Lens Mount': 'Canon RF', 'Screen': '3.0" Touchscreen LCD' }
      },

      // ==========================================
      // BOOKS (10 Products)
      // ==========================================
      {
        name: 'Atomic Habits by James Clear',
        description: 'Tiny Changes, Remarkable Results. The life-changing bestseller on building good habits and breaking bad ones using psychological cues.',
        price: 16.99,
        category_id: categoryMap['Books'],
        stock_quantity: 200,
        image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
        images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
        brand: 'Avery',
        rating: 4.8,
        reviews_count: 15420,
        specifications: { 'Author': 'James Clear', 'Pages': '320', 'Format': 'Hardcover', 'Language': 'English' }
      },
      {
        name: 'The Psychology of Money by Morgan Housel',
        description: 'Timeless lessons on wealth, greed, and happiness. Learn how your behavior, rather than your intelligence, controls financial success.',
        price: 14.99,
        category_id: categoryMap['Books'],
        stock_quantity: 150,
        image_url: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500',
        images: ['https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500'],
        brand: 'Harriman House',
        rating: 4.7,
        reviews_count: 8932,
        specifications: { 'Author': 'Morgan Housel', 'Pages': '256', 'Format': 'Paperback', 'Language': 'English' }
      },
      {
        name: 'Thinking, Fast and Slow by Daniel Kahneman',
        description: 'A masterpiece on cognitive biases and the dual systems governing human thought processes—System 1 (fast/emotional) and System 2 (slow/logical).',
        price: 18.50,
        category_id: categoryMap['Books'],
        stock_quantity: 100,
        image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500',
        images: ['https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500'],
        brand: 'Farrar, Straus and Giroux',
        rating: 4.6,
        reviews_count: 6720,
        specifications: { 'Author': 'Daniel Kahneman', 'Pages': '499', 'Format': 'Paperback', 'Language': 'English' }
      },
      {
        name: 'Deep Work: Rules for Focused Success in a Distracted World',
        description: 'Cal Newport raises a compelling argument for cultivating deep, distraction-free concentration to thrive in the modern knowledge economy.',
        price: 15.99,
        category_id: categoryMap['Books'],
        stock_quantity: 120,
        image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
        images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500'],
        brand: 'Grand Central Publishing',
        rating: 4.7,
        reviews_count: 4350,
        specifications: { 'Author': 'Cal Newport', 'Pages': '304', 'Format': 'Paperback', 'Language': 'English' }
      },
      {
        name: 'The Hobbit by J.R.R. Tolkien (Classic Hardcover Edition)',
        description: 'Follow Bilbo Baggins as he leaves his peaceful home to embark on a magical journey to defeat the dragon Smaug.',
        price: 19.99,
        category_id: categoryMap['Books'],
        stock_quantity: 90,
        image_url: 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=500',
        images: ['https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=500'],
        brand: 'Houghton Mifflin',
        rating: 4.9,
        reviews_count: 12450,
        specifications: { 'Author': 'J.R.R. Tolkien', 'Pages': '320', 'Format': 'Hardcover', 'Language': 'English' }
      },
      {
        name: 'Educated: A Memoir by Tara Westover',
        description: 'An unforgettable memoir about a young girl who leaves her survivalist family in Idaho to pursue educational excellence at Cambridge and Harvard.',
        price: 13.50,
        category_id: categoryMap['Books'],
        stock_quantity: 80,
        image_url: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=500',
        images: ['https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=500'],
        brand: 'Random House',
        rating: 4.7,
        reviews_count: 9840,
        specifications: { 'Author': 'Tara Westover', 'Pages': '352', 'Format': 'Paperback', 'Language': 'English' }
      },
      {
        name: 'Sapiens: A Brief History of Humankind by Yuval Noah Harari',
        description: 'Explore the history of humanity from early hominids to modern technological enhancements in this globally renowned bestseller.',
        price: 17.00,
        category_id: categoryMap['Books'],
        stock_quantity: 110,
        image_url: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=500',
        images: ['https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=500'],
        brand: 'Harper',
        rating: 4.6,
        reviews_count: 14120,
        specifications: { 'Author': 'Yuval Noah Harari', 'Pages': '498', 'Format': 'Paperback', 'Language': 'English' }
      },
      {
        name: 'Code Complete: A Practical Handbook of Software Construction',
        description: 'Widely considered one of the best practical guides to programming, Steve McConnell provides guidelines for clean coding practices.',
        price: 39.99,
        category_id: categoryMap['Books'],
        stock_quantity: 45,
        image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500',
        images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500'],
        brand: 'Microsoft Press',
        rating: 4.8,
        reviews_count: 920,
        specifications: { 'Author': 'Steve McConnell', 'Pages': '960', 'Format': 'Paperback', 'Language': 'English' }
      },
      {
        name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Learn to write clean, professional code.',
        price: 35.99,
        category_id: categoryMap['Books'],
        stock_quantity: 60,
        image_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500',
        images: ['https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500'],
        brand: 'Prentice Hall',
        rating: 4.7,
        reviews_count: 2430,
        specifications: { 'Author': 'Robert C. Martin', 'Pages': '464', 'Format': 'Paperback', 'Language': 'English' }
      },
      {
        name: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        description: 'The bible of software engineering design patterns. Provides structured blueprints to solve common modular software architectural problems.',
        price: 49.99,
        category_id: categoryMap['Books'],
        stock_quantity: 30,
        image_url: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=500',
        images: ['https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=500'],
        brand: 'Addison-Wesley',
        rating: 4.8,
        reviews_count: 1530,
        specifications: { 'Authors': 'Erich Gamma et al.', 'Pages': '395', 'Format': 'Hardcover', 'Language': 'English' }
      },

      // ==========================================
      // CLOTHING (10 Products)
      // ==========================================
      {
        name: "Levi's Men's 501 Original Fit Jeans (Classic Indigo)",
        description: 'The iconic straight leg blue denim jeans with the signature button fly. Crafted in 100% durable cotton.',
        price: 59.99,
        category_id: categoryMap['Clothing'],
        stock_quantity: 110,
        image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
        brand: "Levi's",
        rating: 4.5,
        reviews_count: 5120,
        specifications: { 'Material': '100% Cotton Denim', 'Fit': 'Original Straight', 'Closure': 'Button Fly', 'Care': 'Machine Wash' }
      },
      {
        name: "Nike Air Max 270 Men's Running Sneakers",
        description: "Nike's first lifestyle Air Max unit delivers comfortable support, bold looks, and resilient cushioning.",
        price: 150.00,
        category_id: categoryMap['Clothing'],
        stock_quantity: 80,
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
        brand: 'Nike',
        rating: 4.7,
        reviews_count: 3105,
        specifications: { 'Type': 'Running / Lifestyle', 'Cushioning': '270 Max Air Heel', 'Material': 'Breathable Mesh', 'Color': 'Red/Black' }
      },
      {
        name: "Champion Men's Powerblend Fleece Pullover Hoodie",
        description: 'Warm, cozy, and built to last. Exceptionally soft cotton-polyester blend fleece resist shrinking and pilling.',
        price: 34.99,
        category_id: categoryMap['Clothing'],
        stock_quantity: 140,
        image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500',
        images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500'],
        brand: 'Champion',
        rating: 4.4,
        reviews_count: 1480,
        specifications: { 'Material': '50% Cotton, 50% Polyester', 'Fit': 'Standard Fit', 'Weight': 'Medium Weight', 'Pockets': 'Kangaroo Pocket' }
      },
      {
        name: "Adidas Originals Men's Stan Smith Tennis Shoes",
        description: 'The timeless white leather sneakers that have defined casual clean fashion for decades.',
        price: 85.00,
        category_id: categoryMap['Clothing'],
        stock_quantity: 65,
        image_url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=500',
        images: ['https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=500'],
        brand: 'Adidas',
        rating: 4.6,
        reviews_count: 2310,
        specifications: { 'Material': 'Full-grain Leather Upper', 'Sole': 'Rubber Cupsole', 'Design': 'Perforated 3-Stripes', 'Color': 'Cloud White / Green' }
      },
      {
        name: "Under Armour Men's Tech 2.0 Short-Sleeve T-Shirt",
        description: 'UA Tech fabric is quick-drying, ultra-soft & has a more natural feel. Moisture transport system wicks sweat away.',
        price: 24.99,
        category_id: categoryMap['Clothing'],
        stock_quantity: 250,
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'],
        brand: 'Under Armour',
        rating: 4.5,
        reviews_count: 4210,
        specifications: { 'Material': '100% Polyester Tech Fabric', 'Fit': 'Loose Fit', 'Odor Control': 'Anti-odor tech', 'Drying': 'Fast-Drying' }
      },
      {
        name: "Hanes Men's Crewneck Cotton Undershirts (6-Pack)",
        description: 'Super-soft ringspun cotton undershirts with FreshIQ advanced odor protection technology.',
        price: 19.99,
        category_id: categoryMap['Clothing'],
        stock_quantity: 180,
        image_url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500',
        images: ['https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500'],
        brand: 'Hanes',
        rating: 4.3,
        reviews_count: 8120,
        specifications: { 'Pack Size': '6 shirts', 'Material': '100% Ringspun Cotton', 'Collar': 'Lay-flat Crewneck', 'Tag': 'Tagless design' }
      },
      {
        name: "Carhartt Men's Acrylic Knit Cuffed Beanie",
        description: 'The iconic cold weather ribbed beanie. Stretchy, warm acrylic rib knit with the Carhartt patch on cuff.',
        price: 19.99,
        category_id: categoryMap['Clothing'],
        stock_quantity: 300,
        image_url: 'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=500',
        images: ['https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=500'],
        brand: 'Carhartt',
        rating: 4.8,
        reviews_count: 14230,
        specifications: { 'Material': '100% Acrylic Rib Knit', 'Size': 'One Size Fits All', 'Cuff Height': '4 inches', 'Warmth': 'Heavy Duty' }
      },
      {
        name: "Columbia Men's Glennaker Lake Packable Rain Jacket",
        description: 'Lightweight waterproof nylon shell rain jacket with a stow-away hood and secure zip pockets.',
        price: 49.99,
        category_id: categoryMap['Clothing'],
        stock_quantity: 90,
        image_url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500',
        images: ['https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500'],
        brand: 'Columbia',
        rating: 4.5,
        reviews_count: 2450,
        specifications: { 'Material': '100% Hydroplus Nylon', 'Waterproof': 'Yes', 'Hood': 'Stowaway', 'Packable': 'Folds into pocket' }
      },
      {
        name: "Puma Women's Carina L Platform Sneaker (White)",
        description: 'Retro 80s California beach style tennis trainer sneaker with a raised platform cupsole.',
        price: 64.95,
        category_id: categoryMap['Clothing'],
        stock_quantity: 75,
        image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500',
        images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'],
        brand: 'Puma',
        rating: 4.6,
        reviews_count: 1980,
        specifications: { 'Material': 'Genuine Leather Upper', 'Insole': 'SoftFoam+ cushioning', 'Sole': 'Rubber Platform', 'Color': 'White-Silver' }
      },
      {
        name: 'Ray-Ban Classic Wayfarer Unisex Sunglasses',
        description: 'Since its design in 1952, the Wayfarer Classic gained popularity among celebs and artists for its bold shape.',
        price: 160.00,
        category_id: categoryMap['Clothing'],
        stock_quantity: 50,
        image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
        images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'],
        brand: 'Ray-Ban',
        rating: 4.7,
        reviews_count: 3120,
        specifications: { 'Frame Material': 'Acetate', 'Lens Type': 'G-15 Polarized Green', 'Protection': '100% UV Protection', 'Bridge Width': '22mm' }
      },

      // ==========================================
      // HOME & KITCHEN (10 Products)
      // ==========================================
      {
        name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker (6 Quart)',
        description: 'Multi-use pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer for fast family meals.',
        price: 89.99,
        category_id: categoryMap['Home & Kitchen'],
        stock_quantity: 95,
        image_url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500',
        images: ['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500'],
        brand: 'Instant Pot',
        rating: 4.8,
        reviews_count: 12543,
        specifications: { 'Capacity': '6 Quarts', 'Material': 'Stainless Steel', 'Power': '1000 Watts', 'Control': 'One-Touch Digital' }
      },
      {
        name: 'Ninja Professional 72oz Countertop Blender',
        description: 'Professional grade kitchen blender with 1000 watts of crushing power and multi-tier stainless steel blades.',
        price: 99.99,
        category_id: categoryMap['Home & Kitchen'],
        stock_quantity: 65,
        image_url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500',
        images: ['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500'],
        brand: 'Ninja',
        rating: 4.6,
        reviews_count: 6734,
        specifications: { 'Power': '1000W', 'Liquid Capacity': '72 oz', 'Speeds': '3 Speeds + Pulse', 'Dishwasher Safe': 'Yes' }
      },
      {
        name: 'Keurig K-Express Single Serve K-Cup Pod Coffee Maker',
        description: 'Enjoy delicious hot coffee in minutes. Small, compact design fits anywhere. 3 cup size options.',
        price: 79.99,
        category_id: categoryMap['Home & Kitchen'],
        stock_quantity: 80,
        image_url: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=500',
        images: ['https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=500'],
        brand: 'Keurig',
        rating: 4.5,
        reviews_count: 4890,
        specifications: { 'Brew Sizes': '8, 10, 12 oz', 'Reservoir': '36 oz removable', 'Width': '5.1 inches', 'Color': 'Black' }
      },
      {
        name: 'Lodge Pre-Seasoned Cast Iron Skillet (10.25-Inch)',
        description: 'The essential cast iron frying skillet. Pre-seasoned with 100% natural vegetable oil for a natural nonstick finish.',
        price: 24.90,
        category_id: categoryMap['Home & Kitchen'],
        stock_quantity: 130,
        image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500',
        images: ['https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500'],
        brand: 'Lodge',
        rating: 4.8,
        reviews_count: 18450,
        specifications: { 'Diameter': '10.25 inches', 'Material': 'Cast Iron', 'Cooktops': 'Induction, Gas, Electric, Oven, Campfire', 'Heat Retention': 'Excellent' }
      },
      {
        name: 'Brita Everyday Water Filter Pitcher (10-Cup)',
        description: 'Clean drinking water on tap. Filters out chlorine taste, copper, mercury, and cadmium impurities.',
        price: 21.99,
        category_id: categoryMap['Home & Kitchen'],
        stock_quantity: 110,
        image_url: 'https://images.unsplash.com/photo-1609167735391-49b80fa642a8?w=500',
        images: ['https://images.unsplash.com/photo-1609167735391-49b80fa642a8?w=500'],
        brand: 'Brita',
        rating: 4.6,
        reviews_count: 10420,
        specifications: { 'Capacity': '10 Cups (80 oz)', 'Filter Type': 'Brita Standard Filter', 'Material': 'BPA-Free Plastic', 'Replacement': 'Every 40 gallons' }
      },
      {
        name: 'Pyrex Prepware 3-Piece Glass Measuring Cups Set',
        description: 'Heavy duty tempered glass measuring cups with red, easy-to-read measurement markings.',
        price: 18.99,
        category_id: categoryMap['Home & Kitchen'],
        stock_quantity: 150,
        image_url: 'https://images.unsplash.com/photo-1595272170857-41e97f0a8d46?w=500',
        images: ['https://images.unsplash.com/photo-1595272170857-41e97f0a8d46?w=500'],
        brand: 'Pyrex',
        rating: 4.8,
        reviews_count: 7310,
        specifications: { 'Material': 'Tempered Pyrex Glass', 'Set Size': '3 Cups (1-Cup, 2-Cup, 4-Cup)', 'Oven Safe': 'Yes', 'Microwave/Dishwasher Safe': 'Yes' }
      },
      {
        name: 'COSORI Smart Air Fryer Oven (5.8 Quart)',
        description: 'Cook with up to 85% less oil than traditional deep frying. 11 custom one-touch cooking presets.',
        price: 119.99,
        category_id: categoryMap['Home & Kitchen'],
        stock_quantity: 40,
        image_url: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=500',
        images: ['https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=500'],
        brand: 'COSORI',
        rating: 4.7,
        reviews_count: 12105,
        specifications: { 'Capacity': '5.8 Quarts', 'Power': '1700W', 'Presets': '11 customizable', 'Basket': 'Nonstick, dishwasher safe' }
      },
      {
        name: 'Hamilton Beach 6-Speed Hand Mixer with Snap-On Case',
        description: 'Classic electric hand mixer with traditional beaters and whisk. Snap-on storage case keeps tools together.',
        price: 29.99,
        category_id: categoryMap['Home & Kitchen'],
        stock_quantity: 100,
        image_url: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=500',
        images: ['https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=500'],
        brand: 'Hamilton Beach',
        rating: 4.5,
        reviews_count: 3840,
        specifications: { 'Speeds': '6 speeds + QuickBurst button', 'Attachments': '2 Beaters, 1 Whisk', 'Storage Case': 'Snap-on cover', 'Power': '250 Watts' }
      },
      {
        name: 'KitchenAid Classic Multifunction Utility Can Opener',
        description: 'Smooth manual can opener with high-grade carbon steel cutting wheel and ergonomic handles.',
        price: 14.99,
        category_id: categoryMap['Home & Kitchen'],
        stock_quantity: 200,
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500',
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500'],
        brand: 'KitchenAid',
        rating: 4.6,
        reviews_count: 5930,
        specifications: { 'Cutting Wheel': 'Stainless Steel', 'Length': '8.3 inches', 'Handwash Recommended': 'Yes', 'Color': 'Onyx Black' }
      },
      {
        name: 'Chefman 1.8L Electric Glass Tea Kettle',
        description: 'Rapid-boil electric water kettle with auto shut-off, boil-dry protection, and LED status lights.',
        price: 34.99,
        category_id: categoryMap['Home & Kitchen'],
        stock_quantity: 70,
        image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500',
        images: ['https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500'],
        brand: 'Chefman',
        rating: 4.7,
        reviews_count: 4210,
        specifications: { 'Capacity': '1.8 Liters', 'Material': 'Borosilicate Glass', 'Boil Time': '3-7 minutes', 'Safety': 'Auto Shut-off' }
      },

      // ==========================================
      // SPORTS & OUTDOORS (10 Products)
      // ==========================================
      {
        name: 'Premium Eco-Friendly 6mm Non-Slip Yoga Mat',
        description: 'Thick, comfortable workout mat with non-slip texture on both sides for yoga, pilates, and home exercises.',
        price: 29.95,
        category_id: categoryMap['Sports & Outdoors'],
        stock_quantity: 140,
        image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
        images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
        brand: 'FitLife',
        rating: 4.4,
        reviews_count: 1205,
        specifications: { 'Dimensions': '72 x 24 inches', 'Thickness': '6mm', 'Material': 'TPE (Eco-Friendly)', 'Carrying Strap': 'Included' }
      },
      {
        name: 'Bowflex SelectTech 552 Adjustable Dumbbells (Pair)',
        description: 'Space-saving dumbbells replace 15 sets of weights. Adjust weights dynamically from 5 to 52.5 lbs.',
        price: 429.00,
        category_id: categoryMap['Sports & Outdoors'],
        stock_quantity: 20,
        image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500',
        images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'],
        brand: 'Bowflex',
        rating: 4.8,
        reviews_count: 3920,
        specifications: { 'Weight Range': '5 to 52.5 lbs per dial', 'Settings': '15 weight intervals', 'Grip': 'Ergonomic textured metal', 'Tray': 'Heavy-duty base included' }
      },
      {
        name: 'Coleman Sundome Camping Dome Tent (4-Person)',
        description: 'Quick-pitch dome tent with rainfly and ground vents. Wind-tested up to 35 MPH frames.',
        price: 79.99,
        category_id: categoryMap['Sports & Outdoors'],
        stock_quantity: 35,
        image_url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500',
        images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500'],
        brand: 'Coleman',
        rating: 4.5,
        reviews_count: 9410,
        specifications: { 'Capacity': '4 Persons', 'Dimensions': '9 x 7 feet (4ft 11in center)', 'Setup Time': '10 minutes', 'Weather Protection': 'WeatherTec system' }
      },
      {
        name: 'Hydro Flask Wide Mouth Water Bottle (32oz)',
        description: 'TempShield double-wall vacuum insulation keeps drinks ice cold up to 24 hours or hot up to 12 hours.',
        price: 44.95,
        category_id: categoryMap['Sports & Outdoors'],
        stock_quantity: 150,
        image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
        images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'],
        brand: 'Hydro Flask',
        rating: 4.7,
        reviews_count: 8310,
        specifications: { 'Capacity': '32 oz', 'Material': '18/8 Pro-Grade Stainless Steel', 'Insulation': 'TempShield Vacuum', 'BPA-Free': 'Yes' }
      },
      {
        name: 'Spalding NBA Street Outdoor Rubber Basketball (Size 7)',
        description: 'Durable composite rubber basketball designed to withstand rough concrete courts. Premium tack finish.',
        price: 24.99,
        category_id: categoryMap['Sports & Outdoors'],
        stock_quantity: 80,
        image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500',
        images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500'],
        brand: 'Spalding',
        rating: 4.6,
        reviews_count: 4210,
        specifications: { 'Size': 'Official Size 7 (29.5")', 'Material': 'Performance Outdoor Rubber', 'Bladder': 'Butyl rubber', 'Shipped': 'Deflated' }
      },
      {
        name: 'Wilson NFL Super Grip Composite Leather Football',
        description: 'Tacky composite leather cover with high-definition stitching for superior grip and throwing control.',
        price: 19.99,
        category_id: categoryMap['Sports & Outdoors'],
        stock_quantity: 100,
        image_url: 'https://images.unsplash.com/photo-1562074244-4011e08a8812?w=500',
        images: ['https://images.unsplash.com/photo-1562074244-4011e08a8812?w=500'],
        brand: 'Wilson',
        rating: 4.5,
        reviews_count: 1980,
        specifications: { 'Size': 'Official NFL Size', 'Material': 'Composite Leather', 'Laces': 'NFL Double Lacing', 'Usage': 'Recreational / Training' }
      },
      {
        name: 'Fit Simplify Resistance Loop Exercise Bands (Set of 5)',
        description: 'Natural latex resistance loops in 5 color-coded resistance levels. Perfect for fitness, stretching, and physical therapy.',
        price: 12.95,
        category_id: categoryMap['Sports & Outdoors'],
        stock_quantity: 250,
        image_url: 'https://images.unsplash.com/photo-1598262134440-c3d5500e5720?w=500',
        images: ['https://images.unsplash.com/photo-1598262134440-c3d5500e5720?w=500'],
        brand: 'Fit Simplify',
        rating: 4.4,
        reviews_count: 15420,
        specifications: { 'Material': '100% Natural Latex', 'Loop Size': '12 x 2 inches', 'Resistances': 'X-Light, Light, Medium, Heavy, X-Heavy', 'Bag': 'Carry pouch included' }
      },
      {
        name: 'Garmin Forerunner 55 GPS Smart Running Watch',
        description: 'Easy-to-use running watch tracks heart rate, GPS distance, pace, intervals, and suggested workouts.',
        price: 199.99,
        category_id: categoryMap['Sports & Outdoors'],
        stock_quantity: 30,
        image_url: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500',
        images: ['https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500'],
        brand: 'Garmin',
        rating: 4.6,
        reviews_count: 1890,
        specifications: { 'Display': '1.04" sunlight-visible transflective', 'GPS': 'GPS, GLONASS, Galileo', 'Battery': 'Up to 2 weeks smartwatch | 20h GPS', 'Weight': '37g' }
      },
      {
        name: 'Intex Explorer K2 2-Person Inflatable Kayak Set',
        description: 'Sporty inflatable kayak made from heavy-duty puncture resistant vinyl. Includes aluminum oars and hand pump.',
        price: 149.99,
        category_id: categoryMap['Sports & Outdoors'],
        stock_quantity: 15,
        image_url: 'https://images.unsplash.com/photo-1545642220-410a8e10058b?w=500',
        images: ['https://images.unsplash.com/photo-1545642220-410a8e10058b?w=500'],
        brand: 'Intex',
        rating: 4.5,
        reviews_count: 11450,
        specifications: { 'Capacity': '2 Persons (400 lbs max)', 'Dimensions': '10ft 3in x 3ft x 1ft 8in', 'Oars': '86-inch aluminum oars included', 'Pump': 'High-output manual pump' }
      },
      {
        name: 'CamelBak Rogue Light Hydration Pack (70oz / 2L)',
        description: 'Sleek, lightweight hydration backpack for bicycling and running. Crux reservoir delivers 20% more water per sip.',
        price: 69.95,
        category_id: categoryMap['Sports & Outdoors'],
        stock_quantity: 45,
        image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
        brand: 'CamelBak',
        rating: 4.7,
        reviews_count: 890,
        specifications: { 'Reservoir Capacity': '2 Liters (70 oz)', 'Total Cargo': '7 Liters', 'Back Panel': 'Air Support breathable harness', 'Weight': '215g empty' }
      },

      // ==========================================
      // TOYS & GAMES (10 Products)
      // ==========================================
      {
        name: 'LEGO Creator 3in1 Majestic Tiger Building Set (31129)',
        description: 'Passionate animal fans aged 9+ can build a highly detailed tiger, red panda, or koi fish model using this 755-piece building set.',
        price: 49.99,
        category_id: categoryMap['Toys & Games'],
        stock_quantity: 88,
        image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500',
        images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500'],
        brand: 'LEGO',
        rating: 4.9,
        reviews_count: 432,
        specifications: { 'Model Number': '31129', 'Piece Count': '755', 'Ages': '9+ years', 'Material': 'BPA-Free Plastic' }
      },
      {
        name: 'Catan Board Game (Classic Base Game)',
        description: 'The award-winning modern classic board game of trading, strategy, and settling. Fun for family and friends.',
        price: 44.99,
        category_id: categoryMap['Toys & Games'],
        stock_quantity: 110,
        image_url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=500',
        images: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=500'],
        brand: 'Catan Studio',
        rating: 4.8,
        reviews_count: 10540,
        specifications: { 'Players': '3-4 players', 'Game Duration': '60-90 minutes', 'Ages': '10+ years', 'Type': 'Strategy Board Game' }
      },
      {
        name: 'Melissa & Doug Solid Wood Building Blocks (100-Pack)',
        description: 'Classic wooden block toy set with 100 blocks in 4 colors and 9 shapes. Encourages creative motor coordination.',
        price: 24.99,
        category_id: categoryMap['Toys & Games'],
        stock_quantity: 90,
        image_url: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=500',
        images: ['https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=500'],
        brand: 'Melissa & Doug',
        rating: 4.7,
        reviews_count: 3890,
        specifications: { 'Block Count': '100 blocks', 'Material': 'Solid Natural Wood', 'Finish': 'Non-toxic paint', 'Ages': '3+ years' }
      },
      {
        name: 'Play-Doh Modeling Compound 10-Pack (Assorted Colors)',
        description: 'Classic Play-Doh modeling clay compounds. Includes 10 two-ounce cans of colorful compound to squeeze, shape, and create.',
        price: 9.99,
        category_id: categoryMap['Toys & Games'],
        stock_quantity: 300,
        image_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500',
        images: ['https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500'],
        brand: 'Play-Doh',
        rating: 4.6,
        reviews_count: 5410,
        specifications: { 'Can Size': '2 oz per can', 'Pack Size': '10 cans', 'Non-toxic': 'Yes (contains wheat)', 'Ages': '2+ years' }
      },
      {
        name: 'UNO Card Game (Classic Family Matching Game)',
        description: 'The classic matching card game. Players take turns matching color and numbers to empty their hand. Don\'t forget to yell UNO!',
        price: 6.99,
        category_id: categoryMap['Toys & Games'],
        stock_quantity: 400,
        image_url: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=500',
        images: ['https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=500'],
        brand: 'Mattel Games',
        rating: 4.8,
        reviews_count: 18420,
        specifications: { 'Card Count': '112 Cards', 'Players': '2-10 players', 'Ages': '7+ years', 'Playtime': '15 minutes' }
      },
      {
        name: 'Monopoly Classic Board Game for Families',
        description: 'Buy, sell, dream and scheme. The classic family favorite board game of buying properties, houses, and collecting rent.',
        price: 21.99,
        category_id: categoryMap['Toys & Games'],
        stock_quantity: 130,
        image_url: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=500',
        images: ['https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=500'],
        brand: 'Hasbro Gaming',
        rating: 4.6,
        reviews_count: 8230,
        specifications: { 'Players': '2-6 players', 'Ages': '8+ years', 'Box Includes': 'Gameboard, 8 Tokens, 28 Deeds, Cards, Cash, Dice', 'Average Duration': '60-120 minutes' }
      },
      {
        name: 'Nerf Elite 2.0 Commander RD-6 Blaster',
        description: 'Blaster features a 6-dart rotating drum. Load 6 darts, pump the priming slide, and fire! Fires darts up to 90 feet.',
        price: 14.99,
        category_id: categoryMap['Toys & Games'],
        stock_quantity: 120,
        image_url: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=500',
        images: ['https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=500'],
        brand: 'Nerf',
        rating: 4.5,
        reviews_count: 2310,
        specifications: { 'Rotating Drum': '6-Dart Capacity', 'Darts Included': '12 Nerf Elite Darts', 'Fire Range': 'Up to 90 feet (27m)', 'Batteries Required': 'No' }
      },
      {
        name: 'Jenga Classic Wooden Block Stacking Game',
        description: 'Classic block-stacking family game. Pull out a block, place it on top, and hope the tower doesn\'t crash down!',
        price: 12.99,
        category_id: categoryMap['Toys & Games'],
        stock_quantity: 180,
        image_url: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=500',
        images: ['https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=500'],
        brand: 'Hasbro Gaming',
        rating: 4.7,
        reviews_count: 9450,
        specifications: { 'Block Count': '54 Precision Craft Wood Blocks', 'Ages': '6+ years', 'Players': '1 or more', 'Material': 'Hardwood' }
      },
      {
        name: 'Hot Wheels Gift Pack (9 Toy Cars)',
        description: 'Awesome pack of 9 highly detailed Hot Wheels diecast 1:64 scale toy vehicles. Styles may vary.',
        price: 11.99,
        category_id: categoryMap['Toys & Games'],
        stock_quantity: 150,
        image_url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=500',
        images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=500'],
        brand: 'Hot Wheels',
        rating: 4.7,
        reviews_count: 3910,
        specifications: { 'Scale': '1:64 scale', 'Pack Count': '9 toy cars', 'Material': 'Diecast Metal & Plastic', 'Ages': '3+ years' }
      },
      {
        name: 'Magna-Tiles Clear Colors 32-Piece Geometric 3D Building Set',
        description: 'Original magnetic 3D building tile toys. High-quality plastic tiles click together to create structures.',
        price: 49.99,
        category_id: categoryMap['Toys & Games'],
        stock_quantity: 65,
        image_url: 'https://images.unsplash.com/photo-1608447714925-599deeb5a682?w=500',
        images: ['https://images.unsplash.com/photo-1608447714925-599deeb5a682?w=500'],
        brand: 'Magna-Tiles',
        rating: 4.8,
        reviews_count: 5890,
        specifications: { 'Tile Count': '32 magnetic shapes', 'Material': 'BPA-Free Food-Grade ABS Plastic', 'Connection': 'Ceramic magnets', 'Ages': '3+ years' }
      }
    ];

    // Clear existing products to avoid duplicates when re-seeding
    await query('DELETE FROM products');
    console.log('🧹 Cleared existing products');

    for (const product of products) {
      const specificationsParam = usePostgres 
        ? product.specifications 
        : JSON.stringify(product.specifications);
        
      const imagesParam = usePostgres 
        ? product.images 
        : JSON.stringify(product.images);

      await query(
        `INSERT INTO products (name, description, price, category_id, stock_quantity, image_url, images, brand, rating, reviews_count, specifications, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          product.name,
          product.description,
          product.price,
          product.category_id,
          product.stock_quantity,
          product.image_url,
          imagesParam,
          product.brand,
          product.rating,
          product.reviews_count,
          specificationsParam,
          usePostgres ? true : 1
        ]
      );
    }
    console.log(`✅ ${products.length} products seeded successfully! (Exactly 10 per category)`);
    console.log('🌱 Seeding process complete!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Run seeder only if run directly via command line
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
