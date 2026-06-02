import { PrismaClient } from '@prisma/client';
import { hash } from 'crypto';

const prisma = new PrismaClient();

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and electronics', featured: true, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
  { name: 'Fashion', slug: 'fashion', description: 'Trendy fashion and accessories', featured: true, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
  { name: 'Home & Furniture', slug: 'home-furniture', description: 'Furniture and home decor', featured: true, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400' },
  { name: 'Mobiles', slug: 'mobiles', description: 'Smartphones and mobile accessories', featured: true, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400' },
  { name: 'Appliances', slug: 'appliances', description: 'Home and kitchen appliances', featured: false, image: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400' },
  { name: 'Beauty & Health', slug: 'beauty-health', description: 'Beauty products and health essentials', featured: false, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
  { name: 'Sports & Fitness', slug: 'sports-fitness', description: 'Sports equipment and fitness gear', featured: false, image: 'https://images.unsplash.com/photo-1461896836934-bd45ba890e0a?w=400' },
  { name: 'Books', slug: 'books', description: 'Books and stationery', featured: false, image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400' },
];

const products = [
  // Electronics
  { name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', description: 'The Samsung Galaxy S24 Ultra features a 6.8-inch Dynamic AMOLED display, Snapdragon 8 Gen 3 processor, 200MP camera system with 100x Space Zoom, and S Pen integration. Experience AI-powered photography and the most powerful Galaxy ever.', price: 129999, comparePrice: 144999, images: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600,https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600', categoryId: '', brand: 'Samsung', stock: 45, rating: 4.6, numReviews: 234, featured: true, active: true },
  { name: 'Apple iPhone 15 Pro Max', slug: 'apple-iphone-15-pro-max', description: 'iPhone 15 Pro Max features a titanium design, A17 Pro chip, 48MP Main camera with 5x Optical Zoom, and USB-C. The most powerful iPhone ever with Action Button and always-on display.', price: 159900, comparePrice: 179900, images: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600,https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600', categoryId: '', brand: 'Apple', stock: 30, rating: 4.8, numReviews: 567, featured: true, active: true },
  { name: 'Sony WH-1000XM5 Headphones', slug: 'sony-wh-1000xm5', description: 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming microphones. Up to 30 hours of battery life with quick charging.', price: 29990, comparePrice: 34990, images: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600,https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', categoryId: '', brand: 'Sony', stock: 80, rating: 4.5, numReviews: 189, featured: true, active: true },
  { name: 'MacBook Air M3', slug: 'macbook-air-m3', description: 'Supercharged by M3 chip. 13.6-inch Liquid Retina display. Up to 18 hours of battery life. 8GB unified memory, 256GB SSD. Impossibly thin design.', price: 114900, comparePrice: 119900, images: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600,https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600', categoryId: '', brand: 'Apple', stock: 25, rating: 4.7, numReviews: 345, featured: true, active: true },
  { name: 'iPad Air M2', slug: 'ipad-air-m2', description: 'M2 chip powerhouse. 11-inch Liquid Retina display. All-day battery life. Works with Apple Pencil Pro and Magic Keyboard.', price: 69900, comparePrice: 74900, images: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600,https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600', categoryId: '', brand: 'Apple', stock: 35, rating: 4.4, numReviews: 123, featured: false, active: true },
  { name: 'LG 55" OLED C3 TV', slug: 'lg-55-oled-c3', description: '55-inch 4K OLED evo display with α9 Gen6 AI Processor. Dolby Vision IQ and Dolby Atmos. webOS 23 with smart features. Perfect for movies and gaming.', price: 109990, comparePrice: 149990, images: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600,https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600', categoryId: '', brand: 'LG', stock: 15, rating: 4.7, numReviews: 98, featured: true, active: true },

  // Fashion
  { name: 'Levi\'s 511 Slim Fit Jeans', slug: 'levis-511-slim-fit-jeans', description: 'Classic slim fit jeans with a timeless style. Made from premium denim with stretch for all-day comfort. Features a zip fly and button closure.', price: 2999, comparePrice: 4599, images: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600,https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600', categoryId: '', brand: "Levi's", stock: 120, rating: 4.3, numReviews: 456, featured: true, active: true },
  { name: 'Nike Air Max 270', slug: 'nike-air-max-270', description: 'Lifestyle running shoes with the largest Max Air unit yet. Breathable mesh upper with synthetic overlays. Foam midsole for cushioning.', price: 12995, comparePrice: 15995, images: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600,https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', categoryId: '', brand: 'Nike', stock: 60, rating: 4.5, numReviews: 789, featured: true, active: true },
  { name: 'Ray-Ban Aviator Classic', slug: 'ray-ban-aviator-classic', description: 'Iconic aviator sunglasses with teardrop shaped lenses. Gold frame with green classic G-15 lenses. 100% UV protection.', price: 8990, comparePrice: 10990, images: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600,https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600', categoryId: '', brand: 'Ray-Ban', stock: 40, rating: 4.6, numReviews: 234, featured: false, active: true },
  { name: 'Adidas Ultraboost 23', slug: 'adidas-ultraboost-23', description: 'Responsive running shoes with BOOST midsole. Primeknit+ upper for adaptive fit. Continental rubber outsole for grip.', price: 16999, comparePrice: 19999, images: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600,https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600', categoryId: '', brand: 'Adidas', stock: 50, rating: 4.4, numReviews: 321, featured: true, active: true },
  { name: 'Tommy Hilfiger Polo Shirt', slug: 'tommy-hilfiger-polo-shirt', description: 'Classic fit polo shirt in premium cotton. Features the iconic Tommy Hilfiger flag embroidery. Ribbed collar and cuffs.', price: 3999, comparePrice: 5499, images: 'https://images.unsplash.com/photo-1625910513413-5fc421e0b6cd?w=600,https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600', categoryId: '', brand: 'Tommy Hilfiger', stock: 75, rating: 4.2, numReviews: 167, featured: false, active: true },

  // Home & Furniture
  { name: 'Ergonomic Office Chair', slug: 'ergonomic-office-chair', description: 'Premium ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh back. Supports up to 120kg. 5-year warranty.', price: 14999, comparePrice: 22999, images: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600,https://images.unsplash.com/photo-1589364235049-6485937817f3?w=600', categoryId: '', brand: 'Featherlite', stock: 20, rating: 4.3, numReviews: 89, featured: true, active: true },
  { name: 'Wooden King Size Bed', slug: 'wooden-king-size-bed', description: 'Sheesham wood king size bed with headboard. Natural finish with modern design. Includes wooden slat support system. Easy assembly.', price: 34999, comparePrice: 49999, images: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600,https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600', categoryId: '', brand: 'Urban Ladder', stock: 10, rating: 4.1, numReviews: 56, featured: false, active: true },
  { name: 'Samsung 253L Refrigerator', slug: 'samsung-253l-refrigerator', description: '253L capacity frost free double door refrigerator. Digital Inverter Compressor. Coolpack feature. Convertible freezer. Energy efficient.', price: 25490, comparePrice: 32990, images: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600,https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600', categoryId: '', brand: 'Samsung', stock: 18, rating: 4.4, numReviews: 345, featured: true, active: true },
  { name: 'Dyson V15 Detect Vacuum', slug: 'dyson-v15-detect-vacuum', description: 'Cordless vacuum with laser dust detection. Piezo sensor counts and sizes particles. LCD screen shows scientific proof of a deep clean. Up to 60 minutes run time.', price: 52900, comparePrice: 58900, images: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600,https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600', categoryId: '', brand: 'Dyson', stock: 12, rating: 4.6, numReviews: 78, featured: false, active: true },

  // Mobiles
  { name: 'OnePlus 12', slug: 'oneplus-12', description: 'Snapdragon 8 Gen 3, 50MP Hasselblad Camera with 64MP 3x Periscope, 2K Display with 4500 nits peak brightness, 5400mAh battery with 100W SUPERVOOC.', price: 64999, comparePrice: 69999, images: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600,https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600', categoryId: '', brand: 'OnePlus', stock: 55, rating: 4.5, numReviews: 432, featured: true, active: true },
  { name: 'Google Pixel 8 Pro', slug: 'google-pixel-8-pro', description: 'Google Tensor G3 chip. 50MP camera with AI-powered photo editing. 7 years of OS and security updates. 6.7-inch Super Actua display.', price: 79999, comparePrice: 94999, images: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600,https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600', categoryId: '', brand: 'Google', stock: 22, rating: 4.4, numReviews: 198, featured: false, active: true },
  { name: 'Redmi Note 13 Pro+', slug: 'redmi-note-13-pro-plus', description: '200MP camera with OIS. MediaTek Dimensity 7200-Ultra. 6.67-inch AMOLED display with 120Hz. 5000mAh with 120W hypercharging.', price: 24999, comparePrice: 29999, images: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600,https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600', categoryId: '', brand: 'Xiaomi', stock: 100, rating: 4.2, numReviews: 567, featured: true, active: true },
  { name: 'Samsung Galaxy Watch 6', slug: 'samsung-galaxy-watch-6', description: 'Advanced health monitoring with BioActive Sensor. Sleep coaching, heart rate monitoring, body composition analysis. Wear OS powered by Samsung.', price: 26999, comparePrice: 33999, images: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600,https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600', categoryId: '', brand: 'Samsung', stock: 40, rating: 4.3, numReviews: 156, featured: false, active: true },

  // Appliances
  { name: 'IFB 8kg Front Load Washing Machine', slug: 'ifb-8kg-front-load', description: '8kg capacity front loading washing machine. 1400 RPM spin speed. Steam wash, allergen wash, cradle wash. 4-year comprehensive warranty.', price: 31990, comparePrice: 39990, images: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600,https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600', categoryId: '', brand: 'IFB', stock: 25, rating: 4.1, numReviews: 234, featured: false, active: true },
  { name: 'Dyson Airwrap Multi-Styler', slug: 'dyson-airwrap-multi-styler', description: 'Multi-styler with Coanda effect for curling, waving, smoothing and drying. Enhanced attachments for different hair types. Intelligent heat control.', price: 43900, comparePrice: 49900, images: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600,https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600', categoryId: '', brand: 'Dyson', stock: 15, rating: 4.7, numReviews: 345, featured: true, active: true },

  // Beauty
  { name: 'Mac Studio Fix Foundation', slug: 'mac-studio-fix-foundation', description: '24-hour wear, buildable coverage with a natural matte finish. SPF 15 protection. Available in 60+ shades. Oil-free and sweat-resistant formula.', price: 2450, comparePrice: 2950, images: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600,https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600', categoryId: '', brand: 'MAC', stock: 90, rating: 4.5, numReviews: 678, featured: false, active: true },
  { name: 'Philips Lumea IPL Hair Remover', slug: 'philips-lumea-ipl', description: 'Cordless IPL hair removal device with SmartSkin sensor. Up to 5 settings for personalized treatment. Results visible in just 3 bi-weekly sessions.', price: 29999, comparePrice: 39999, images: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600,https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600', categoryId: '', brand: 'Philips', stock: 20, rating: 4.3, numReviews: 123, featured: false, active: true },

  // Sports
  { name: 'Yoga Mat Premium 6mm', slug: 'yoga-mat-premium-6mm', description: 'Extra thick 6mm premium yoga mat with anti-slip texture. Eco-friendly TPE material. Dual color design. Includes carry strap.', price: 1299, comparePrice: 1999, images: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600,https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600', categoryId: '', brand: 'Boldfit', stock: 200, rating: 4.4, numReviews: 890, featured: false, active: true },
  { name: 'Nike Dri-FIT Running Shorts', slug: 'nike-dri-fit-running-shorts', description: 'Lightweight running shorts with Dri-FIT technology. Mesh side panels for breathability. Built-in briefs. Reflective elements for visibility.', price: 2195, comparePrice: 2995, images: 'https://images.unsplash.com/photo-1562886877-aaaa5c23b300?w=600,https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600', categoryId: '', brand: 'Nike', stock: 85, rating: 4.2, numReviews: 234, featured: false, active: true },

  // Books
  { name: 'Atomic Habits', slug: 'atomic-habits', description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones by James Clear. The #1 New York Times bestseller with over 10 million copies sold worldwide.', price: 399, comparePrice: 599, images: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600,https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', categoryId: '', brand: 'Penguin', stock: 300, rating: 4.8, numReviews: 2345, featured: true, active: true },
  { name: 'The Psychology of Money', slug: 'psychology-of-money', description: 'Timeless Lessons on Wealth, Greed, and Happiness by Morgan Housel. Understanding the strange ways people think about money.', price: 299, comparePrice: 499, images: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600,https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600', categoryId: '', brand: 'Harriman House', stock: 250, rating: 4.7, numReviews: 1890, featured: true, active: true },
];

const banners = [
  { title: 'Big Billion Days', subtitle: 'Up to 80% Off on Electronics', image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200', link: '/products?category=electronics', active: true, order: 1 },
  { title: 'Fashion Week Sale', subtitle: 'Flat 50-70% Off on Top Brands', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200', link: '/products?category=fashion', active: true, order: 2 },
  { title: 'Smartphone Fest', subtitle: 'Exchange Offers & No Cost EMI', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200', link: '/products?category=mobiles', active: true, order: 3 },
  { title: 'Home Makeover', subtitle: 'Starting ₹149 on Home Essentials', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', link: '/products?category=home-furniture', active: true, order: 4 },
];

const coupons = [
  { code: 'WELCOME10', discount: 10, discountType: 'PERCENTAGE', minPurchase: 500, maxDiscount: 200, active: true, expiresAt: new Date('2025-12-31'), usageLimit: 1000, usageCount: 234 },
  { code: 'FLAT500', discount: 500, discountType: 'FIXED', minPurchase: 2000, maxDiscount: null, active: true, expiresAt: new Date('2025-12-31'), usageLimit: 500, usageCount: 89 },
  { code: 'SAVE20', discount: 20, discountType: 'PERCENTAGE', minPurchase: 1000, maxDiscount: 1000, active: true, expiresAt: new Date('2025-06-30'), usageLimit: 200, usageCount: 156 },
  { code: 'FIRSTORDER', discount: 15, discountType: 'PERCENTAGE', minPurchase: 0, maxDiscount: 300, active: true, expiresAt: new Date('2025-12-31'), usageLimit: 5000, usageCount: 1234 },
  { code: 'SUMMER25', discount: 25, discountType: 'PERCENTAGE', minPurchase: 3000, maxDiscount: 1500, active: false, expiresAt: new Date('2025-03-31'), usageLimit: 100, usageCount: 100 },
];

function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hashed_' + Math.abs(hash).toString(36) + '_' + Buffer.from(password).toString('base64');
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@g-ecom.com',
      name: 'Admin User',
      password: simpleHash('admin123'),
      role: 'ADMIN',
      phone: '9876543210',
      street: '123 Admin Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      password: simpleHash('password123'),
      role: 'USER',
      phone: '9876543211',
      street: '456 Park Avenue',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: simpleHash('password123'),
      role: 'USER',
      phone: '9876543212',
      street: '789 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
    },
  });
  const user3 = await prisma.user.create({
    data: {
      email: 'rahul@example.com',
      name: 'Rahul Sharma',
      password: simpleHash('password123'),
      role: 'USER',
      phone: '9876543213',
      street: '321 Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560025',
    },
  });
  console.log('✅ Test users created');

  // Create categories
  const categoryRecords = [];
  for (const cat of categories) {
    const record = await prisma.category.create({ data: cat });
    categoryRecords.push(record);
  }
  console.log(`✅ ${categoryRecords.length} categories created`);

  // Create products with correct category IDs
  const productRecords = [];
  for (const product of products) {
    let categorySlug = '';
    if (product.slug.includes('samsung-galaxy-s24') || product.slug.includes('iphone') || product.slug.includes('sony-wh') || product.slug.includes('macbook') || product.slug.includes('ipad') || product.slug.includes('lg-55')) {
      categorySlug = 'electronics';
    } else if (product.slug.includes('levis') || product.slug.includes('nike-air') || product.slug.includes('ray-ban') || product.slug.includes('adidas') || product.slug.includes('tommy')) {
      categorySlug = 'fashion';
    } else if (product.slug.includes('office-chair') || product.slug.includes('king-size-bed') || product.slug.includes('refrigerator') || product.slug.includes('dyson-v15')) {
      categorySlug = 'home-furniture';
    } else if (product.slug.includes('oneplus') || product.slug.includes('pixel') || product.slug.includes('redmi') || product.slug.includes('galaxy-watch')) {
      categorySlug = 'mobiles';
    } else if (product.slug.includes('washing') || product.slug.includes('airwrap')) {
      categorySlug = 'appliances';
    } else if (product.slug.includes('mac-') || product.slug.includes('lumea')) {
      categorySlug = 'beauty-health';
    } else if (product.slug.includes('yoga') || product.slug.includes('dri-fit')) {
      categorySlug = 'sports-fitness';
    } else if (product.slug.includes('atomic') || product.slug.includes('psychology')) {
      categorySlug = 'books';
    }

    const category = categoryRecords.find(c => c.slug === categorySlug);
    if (category) {
      const record = await prisma.product.create({
        data: { ...product, categoryId: category.id },
      });
      productRecords.push(record);
    }
  }
  console.log(`✅ ${productRecords.length} products created`);

  // Create banners
  for (const banner of banners) {
    await prisma.banner.create({ data: banner });
  }
  console.log(`✅ ${banners.length} banners created`);

  // Create coupons
  for (const coupon of coupons) {
    await prisma.coupon.create({ data: coupon });
  }
  console.log(`✅ ${coupons.length} coupons created`);

  // Create sample carts
  const cart1 = await prisma.cart.create({
    data: {
      userId: user1.id,
      items: {
        create: [
          { productId: productRecords[0].id, quantity: 1 },
          { productId: productRecords[7].id, quantity: 2 },
        ],
      },
    },
  });

  // Create wishlist items
  await prisma.wishlist.createMany({
    data: [
      { userId: user1.id, productId: productRecords[1].id },
      { userId: user1.id, productId: productRecords[3].id },
      { userId: user2.id, productId: productRecords[0].id },
      { userId: user2.id, productId: productRecords[5].id },
    ],
  });
  console.log('✅ Cart and wishlist items created');

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      total: 162988,
      subtotal: 159998,
      tax: 0,
      shipping: 0,
      discount: 0,
      status: 'DELIVERED',
      paymentMethod: 'CARD',
      paymentStatus: 'COMPLETED',
      shippingStreet: '456 Park Avenue',
      shippingCity: 'Delhi',
      shippingState: 'Delhi',
      shippingZipCode: '110001',
      shippingCountry: 'India',
      items: {
        create: [
          { productId: productRecords[0].id, quantity: 1, price: 129999 },
          { productId: productRecords[7].id, quantity: 1, price: 29999 },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: user1.id,
      total: 4998,
      subtotal: 4998,
      tax: 0,
      shipping: 0,
      discount: 0,
      status: 'SHIPPED',
      paymentMethod: 'UPI',
      paymentStatus: 'COMPLETED',
      shippingStreet: '456 Park Avenue',
      shippingCity: 'Delhi',
      shippingState: 'Delhi',
      shippingZipCode: '110001',
      shippingCountry: 'India',
      items: {
        create: [
          { productId: productRecords[6].id, quantity: 1, price: 2999 },
          { productId: productRecords[21].id, quantity: 1, price: 1999 },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      userId: user2.id,
      total: 114900,
      subtotal: 114900,
      tax: 0,
      shipping: 0,
      discount: 0,
      status: 'PROCESSING',
      paymentMethod: 'CARD',
      paymentStatus: 'COMPLETED',
      shippingStreet: '789 MG Road',
      shippingCity: 'Bangalore',
      shippingState: 'Karnataka',
      shippingZipCode: '560001',
      shippingCountry: 'India',
      items: {
        create: [
          { productId: productRecords[3].id, quantity: 1, price: 114900 },
        ],
      },
    },
  });

  const order4 = await prisma.order.create({
    data: {
      userId: user3.id,
      total: 94997,
      subtotal: 94997,
      tax: 0,
      shipping: 0,
      discount: 0,
      status: 'PENDING',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      shippingStreet: '321 Brigade Road',
      shippingCity: 'Bangalore',
      shippingState: 'Karnataka',
      shippingZipCode: '560025',
      shippingCountry: 'India',
      couponCode: 'WELCOME10',
      items: {
        create: [
          { productId: productRecords[14].id, quantity: 1, price: 64999 },
          { productId: productRecords[2].id, quantity: 1, price: 29990 },
        ],
      },
    },
  });

  const order5 = await prisma.order.create({
    data: {
      userId: user3.id,
      total: 698,
      subtotal: 698,
      tax: 0,
      shipping: 0,
      discount: 0,
      status: 'CANCELLED',
      paymentMethod: 'UPI',
      paymentStatus: 'REFUNDED',
      shippingStreet: '321 Brigade Road',
      shippingCity: 'Bangalore',
      shippingState: 'Karnataka',
      shippingZipCode: '560025',
      shippingCountry: 'India',
      items: {
        create: [
          { productId: productRecords[22].id, quantity: 1, price: 399 },
          { productId: productRecords[23].id, quantity: 1, price: 299 },
        ],
      },
    },
  });
  console.log('✅ Sample orders created');

  // Create reviews
  await prisma.review.createMany({
    data: [
      { userId: user1.id, productId: productRecords[0].id, rating: 5, comment: 'Amazing phone! Camera quality is outstanding.' },
      { userId: user2.id, productId: productRecords[0].id, rating: 4, comment: 'Great phone but a bit pricey.' },
      { userId: user1.id, productId: productRecords[3].id, rating: 5, comment: 'Best laptop I have ever used. Battery life is incredible!' },
      { userId: user3.id, productId: productRecords[7].id, rating: 4, comment: 'Good quality jeans. Fits perfectly.' },
      { userId: user2.id, productId: productRecords[22].id, rating: 5, comment: 'Life-changing book! Must read for everyone.' },
    ],
  });
  console.log('✅ Sample reviews created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📧 Login credentials:');
  console.log('   Admin: admin@g-ecom.com / admin123');
  console.log('   User:  john@example.com / password123');
  console.log('   User:  jane@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
