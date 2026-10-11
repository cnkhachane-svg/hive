const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🐝 Starting HIVE Database Seed...");

  // Clean existing data
  await prisma.priceHistory.deleteMany();
  await prisma.purchaseFeedback.deleteMany();
  await prisma.comparison.deleteMany();
  await prisma.trustedStore.deleteMany();
  await prisma.savedProduct.deleteMany();
  await prisma.shoppingListItem.deleteMany();
  await prisma.shoppingList.deleteMany();
  await prisma.onlineOffer.deleteMany();
  await prisma.storeInventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.store.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("hive123", 10);

  // 1. Create Users
  const shopper = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "shopper@hive.in",
      passwordHash,
      role: "USER",
      preferences: {
        create: {
          mainPriority: "COST",
          urgency: "NOT_URGENT",
          preferredRadiusKm: 3.0,
          transportMode: "WALK",
          walkCostPerKm: 0,
          bikeCostPerKm: 500,
          carCostPerKm: 1200,
        },
      },
    },
  });

  const owner = await prisma.user.create({
    data: {
      name: "Ramesh Patel",
      email: "owner@hive.in",
      passwordHash,
      role: "STORE_OWNER",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "HIVE Administrator",
      email: "admin@hive.in",
      passwordHash,
      role: "ADMIN",
    },
  });

  // 2. Create Categories
  const categoriesData = [
    { name: "Groceries & Staples", slug: "groceries", icon: "Wheat" },
    { name: "Dairy & Breakfast", slug: "dairy", icon: "Milk" },
    { name: "Snacks & Biscuits", slug: "snacks", icon: "Cookie" },
    { name: "Beverages & Tea", slug: "beverages", icon: "Coffee" },
    { name: "Household Essentials", slug: "household", icon: "Sparkles" },
    { name: "Personal Care", slug: "personal-care", icon: "Heart" },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.productCategory.create({ data: cat });
    categories[cat.slug] = created;
  }

  // 3. Create Stores (Pune, Kothrud & Deccan)
  // Base shopper location: 18.5089° N, 73.8050° E (Kothrud, Pune)
  const store1 = await prisma.store.create({
    data: {
      name: "Apna Kirana & General Store",
      ownerId: owner.id,
      address: "Shop 4, Mayur Colony, Kothrud",
      locality: "Mayur Colony, Kothrud",
      city: "Pune",
      lat: 18.5098,
      lng: 73.8075, // ~350 meters away
      phone: "+91 98230 11223",
      openingHours: "7:30 AM - 10:30 PM",
      isOpen: true,
      verified: true,
      rating: 4.8,
      ratingCount: 118,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: "Laxmi Super Market",
      address: "Near Ideal Colony Ground, Paud Road",
      locality: "Ideal Colony, Kothrud",
      city: "Pune",
      lat: 18.5135,
      lng: 73.8090, // ~650 meters away
      phone: "+91 98224 44556",
      openingHours: "8:00 AM - 10:00 PM",
      isOpen: true,
      verified: true,
      rating: 4.6,
      ratingCount: 84,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: "Shree Ganesh Provision Stores",
      address: "12 Karve Road, Near Nal Stop",
      locality: "Erandwane",
      city: "Pune",
      lat: 18.5040,
      lng: 73.8180, // ~1.5 km away
      phone: "+91 98231 77889",
      openingHours: "7:00 AM - 9:30 PM",
      isOpen: true,
      verified: false,
      rating: 4.5,
      ratingCount: 62,
    },
  });

  const store4 = await prisma.store.create({
    data: {
      name: "Mahalaxmi Daily Needs & Dairy",
      address: "Plot 88, Dahanukar Colony, Kothrud",
      locality: "Dahanukar Colony",
      city: "Pune",
      lat: 18.4985,
      lng: 73.7995, // ~1.3 km away
      phone: "+91 98239 99001",
      openingHours: "6:30 AM - 11:00 PM",
      isOpen: true,
      verified: true,
      rating: 4.7,
      ratingCount: 95,
    },
  });

  // Mark store1 as trusted by shopper
  await prisma.trustedStore.create({
    data: {
      userId: shopper.id,
      storeId: store1.id,
      notes: "Quick billing, fresh stock, very friendly owner.",
    },
  });

  // 4. Products & Offers
  // Exact Section 25 Acceptance Test product: Rice 1kg
  // Online: ₹80 + ₹20 delivery = ₹100 in 25 mins
  // Kirana: ₹82 + ₹0 travel = ₹82 in 4 mins (350m)
  const rice = await prisma.product.create({
    data: {
      name: "Sona Masoori Rice (1 kg)",
      brand: "India Gate",
      categoryId: categories["groceries"].id,
      standardQuantity: "1 kg",
      unit: "kg",
      barcode: "890123456001",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60",
    },
  });

  await prisma.onlineOffer.create({
    data: {
      platform: "Blinkit",
      productId: rice.id,
      pricePaise: 8000, // ₹80
      deliveryFeePaise: 2000, // ₹20
      serviceFeePaise: 0,
      discountPaise: 0,
      estimatedMinutes: 25,
      inStock: true,
    },
  });

  await prisma.storeInventory.create({
    data: {
      storeId: store1.id,
      productId: rice.id,
      pricePaise: 8200, // ₹82
      inStock: true,
      stockQuantity: 40,
      stockStatus: "IN_STOCK",
      discountPaise: 0,
      source: "VERIFIED_AUDIT",
    },
  });

  await prisma.storeInventory.create({
    data: {
      storeId: store2.id,
      productId: rice.id,
      pricePaise: 8500, // ₹85
      inStock: true,
      stockQuantity: 15,
      stockStatus: "IN_STOCK",
      discountPaise: 0,
      source: "DEMO_FEED",
    },
  });

  // Product 2: Milk 1 litre
  const milk = await prisma.product.create({
    data: {
      name: "Amul Taaza Fresh Toned Milk (1 Litre)",
      brand: "Amul",
      categoryId: categories["dairy"].id,
      standardQuantity: "1 litre",
      unit: "litre",
      barcode: "890123456002",
      imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60",
    },
  });

  await prisma.onlineOffer.create({
    data: {
      platform: "Zepto",
      productId: milk.id,
      pricePaise: 5600, // ₹56
      deliveryFeePaise: 2500, // ₹25
      serviceFeePaise: 0,
      discountPaise: 0,
      estimatedMinutes: 12,
      inStock: true,
    },
  });

  await prisma.storeInventory.create({
    data: {
      storeId: store1.id,
      productId: milk.id,
      pricePaise: 5400, // ₹54
      inStock: true,
      stockQuantity: 20,
      stockStatus: "IN_STOCK",
      discountPaise: 0,
      source: "STORE_OWNER",
    },
  });

  // Product 3: Bread 400g
  const bread = await prisma.product.create({
    data: {
      name: "Britannia 100% Whole Wheat Bread (400 g)",
      brand: "Britannia",
      categoryId: categories["dairy"].id,
      standardQuantity: "400 g",
      unit: "g",
      barcode: "890123456003",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60",
    },
  });

  await prisma.onlineOffer.create({
    data: {
      platform: "Blinkit",
      productId: bread.id,
      pricePaise: 4500, // ₹45
      deliveryFeePaise: 2000, // ₹20
      serviceFeePaise: 0,
      discountPaise: 0,
      estimatedMinutes: 20,
      inStock: true,
    },
  });

  await prisma.storeInventory.create({
    data: {
      storeId: store1.id,
      productId: bread.id,
      pricePaise: 4200, // ₹42
      inStock: true,
      stockQuantity: 12,
      stockStatus: "IN_STOCK",
      discountPaise: 0,
      source: "STORE_OWNER",
    },
  });

  // Product 4: Biscuits (Cheaper online!)
  const biscuits = await prisma.product.create({
    data: {
      name: "Parle-G Gold Biscuits Family Pack (1 kg)",
      brand: "Parle",
      categoryId: categories["snacks"].id,
      standardQuantity: "1 kg",
      unit: "packet",
      barcode: "890123456004",
      imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=60",
    },
  });

  await prisma.onlineOffer.create({
    data: {
      platform: "Amazon Fresh",
      productId: biscuits.id,
      pricePaise: 11000, // ₹110
      deliveryFeePaise: 0, // ₹0 free delivery
      serviceFeePaise: 0,
      discountPaise: 1500, // ₹15 discount
      estimatedMinutes: 90,
      inStock: true,
    },
  });

  await prisma.storeInventory.create({
    data: {
      storeId: store1.id,
      productId: biscuits.id,
      pricePaise: 13000, // ₹130
      inStock: true,
      stockQuantity: 18,
      stockStatus: "IN_STOCK",
      discountPaise: 0,
      source: "DEMO_FEED",
    },
  });

  // Product 5: Cooking Oil 1 litre
  const oil = await prisma.product.create({
    data: {
      name: "Fortune Sunlite Refined Sunflower Oil (1 Litre)",
      brand: "Fortune",
      categoryId: categories["groceries"].id,
      standardQuantity: "1 litre",
      unit: "litre",
      barcode: "890123456005",
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60",
    },
  });

  await prisma.onlineOffer.create({
    data: {
      platform: "BigBasket",
      productId: oil.id,
      pricePaise: 14800, // ₹148
      deliveryFeePaise: 3000, // ₹30
      serviceFeePaise: 500, // ₹5
      discountPaise: 0,
      estimatedMinutes: 60,
      inStock: true,
    },
  });

  await prisma.storeInventory.create({
    data: {
      storeId: store1.id,
      productId: oil.id,
      pricePaise: 14200, // ₹142
      inStock: true,
      stockQuantity: 25,
      stockStatus: "IN_STOCK",
      discountPaise: 0,
      source: "STORE_OWNER",
    },
  });

  // Product 6: Tata Salt (1 kg)
  const salt = await prisma.product.create({
    data: {
      name: "Tata Salt Vacuum Evaporated Iodised (1 kg)",
      brand: "Tata",
      categoryId: categories["groceries"].id,
      standardQuantity: "1 kg",
      unit: "kg",
      barcode: "890123456006",
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=60",
    },
  });

  await prisma.onlineOffer.create({
    data: {
      platform: "Instamart",
      productId: salt.id,
      pricePaise: 2800, // ₹28
      deliveryFeePaise: 2000, // ₹20
      serviceFeePaise: 200,
      discountPaise: 0,
      estimatedMinutes: 18,
      inStock: true,
    },
  });

  await prisma.storeInventory.create({
    data: {
      storeId: store1.id,
      productId: salt.id,
      pricePaise: 2600, // ₹26
      inStock: true,
      stockQuantity: 50,
      stockStatus: "IN_STOCK",
      discountPaise: 0,
      source: "STORE_OWNER",
    },
  });

  // Product 7: Aashirvaad Atta (5 kg) - Cheaper online on bulk deals
  const atta = await prisma.product.create({
    data: {
      name: "Aashirvaad Superior MP Shudh Chakki Atta (5 kg)",
      brand: "Aashirvaad",
      categoryId: categories["groceries"].id,
      standardQuantity: "5 kg",
      unit: "kg",
      barcode: "890123456007",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60",
    },
  });

  await prisma.onlineOffer.create({
    data: {
      platform: "Amazon Fresh",
      productId: atta.id,
      pricePaise: 24000, // ₹240
      deliveryFeePaise: 0, // ₹0
      serviceFeePaise: 0,
      discountPaise: 2000, // ₹20
      estimatedMinutes: 90,
      inStock: true,
    },
  });

  await prisma.storeInventory.create({
    data: {
      storeId: store1.id,
      productId: atta.id,
      pricePaise: 26500, // ₹265
      inStock: true,
      stockQuantity: 10,
      stockStatus: "IN_STOCK",
      discountPaise: 0,
      source: "STORE_OWNER",
    },
  });

  // Product 8: Surf Excel Detergent Powder (1 kg)
  const detergent = await prisma.product.create({
    data: {
      name: "Surf Excel Easy Wash Detergent Powder (1 kg)",
      brand: "Surf Excel",
      categoryId: categories["household"].id,
      standardQuantity: "1 kg",
      unit: "kg",
      barcode: "890123456008",
      imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500&auto=format&fit=crop&q=60",
    },
  });

  await prisma.onlineOffer.create({
    data: {
      platform: "Zepto",
      productId: detergent.id,
      pricePaise: 13500, // ₹135
      deliveryFeePaise: 2500, // ₹25
      serviceFeePaise: 0,
      discountPaise: 0,
      estimatedMinutes: 15,
      inStock: true,
    },
  });

  await prisma.storeInventory.create({
    data: {
      storeId: store1.id,
      productId: detergent.id,
      pricePaise: 13000, // ₹130
      inStock: true,
      stockQuantity: 15,
      stockStatus: "IN_STOCK",
      discountPaise: 0,
      source: "STORE_OWNER",
    },
  });

  // Product 9: Dettol Bathing Soap (Pack of 4)
  const soap = await prisma.product.create({
    data: {
      name: "Dettol Original Germ Protection Bathing Soap (125 g x 4)",
      brand: "Dettol",
      categoryId: categories["personal-care"].id,
      standardQuantity: "4 x 125 g",
      unit: "packet",
      barcode: "890123456009",
      imageUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=60",
    },
  });

  await prisma.onlineOffer.create({
    data: {
      platform: "Blinkit",
      productId: soap.id,
      pricePaise: 19500, // ₹195
      deliveryFeePaise: 2000, // ₹20
      serviceFeePaise: 0,
      discountPaise: 0,
      estimatedMinutes: 20,
      inStock: true,
    },
  });

  await prisma.storeInventory.create({
    data: {
      storeId: store1.id,
      productId: soap.id,
      pricePaise: 21000, // ₹210
      inStock: true,
      stockQuantity: 8,
      stockStatus: "IN_STOCK",
      discountPaise: 0,
      source: "STORE_OWNER",
    },
  });

  // Product 10: Maggi 2-Minute Noodles (420 g pack)
  const maggi = await prisma.product.create({
    data: {
      name: "Nestle Maggi 2-Minute Masala Instant Noodles (Pack of 6, 420 g)",
      brand: "Nestle",
      categoryId: categories["snacks"].id,
      standardQuantity: "420 g",
      unit: "packet",
      barcode: "890123456010",
      imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=60",
    },
  });

  await prisma.onlineOffer.create({
    data: {
      platform: "Instamart",
      productId: maggi.id,
      pricePaise: 8400, // ₹84
      deliveryFeePaise: 2000, // ₹20
      serviceFeePaise: 200,
      discountPaise: 0,
      estimatedMinutes: 15,
      inStock: true,
    },
  });

  await prisma.storeInventory.create({
    data: {
      storeId: store1.id,
      productId: maggi.id,
      pricePaise: 8000, // ₹80
      inStock: true,
      stockQuantity: 30,
      stockStatus: "IN_STOCK",
      discountPaise: 0,
      source: "STORE_OWNER",
    },
  });

  // 5. Seed a demo shopping list with 5 items
  const demoList = await prisma.shoppingList.create({
    data: {
      userId: shopper.id,
      name: "Weekly Essentials Basket",
      isSaved: true,
      items: {
        create: [
          { productId: rice.id, quantity: 1, selectedPlan: "AUTO" },
          { productId: milk.id, quantity: 2, selectedPlan: "AUTO" },
          { productId: bread.id, quantity: 1, selectedPlan: "AUTO" },
          { productId: biscuits.id, quantity: 2, selectedPlan: "AUTO" },
          { productId: oil.id, quantity: 1, selectedPlan: "AUTO" },
        ],
      },
    },
  });

  // 6. Seed recorded purchases and feedbacks for insights dashboard
  await prisma.purchaseFeedback.create({
    data: {
      userId: shopper.id,
      storeId: store1.id,
      productId: rice.id,
      rating: 5,
      review: "Purchased in 5 mins. Saved ₹18 compared to quick commerce!",
      actualSpentPaise: 8200,
      savedAmountPaise: 1800,
      isVerifiedPurchase: true,
    },
  });

  await prisma.purchaseFeedback.create({
    data: {
      userId: shopper.id,
      storeId: store1.id,
      productId: milk.id,
      rating: 5,
      review: "Super fresh morning milk packet from Ramesh bhai.",
      actualSpentPaise: 10800,
      savedAmountPaise: 5400, // vs online with delivery
      isVerifiedPurchase: true,
    },
  });

  // Recorded comparison history
  await prisma.comparison.create({
    data: {
      userId: shopper.id,
      productId: rice.id,
      recommendedSource: "KIRANA",
      calculationDetails: JSON.stringify({
        onlineEffectivePaise: 10000,
        kiranaEffectivePaise: 8200,
        differencePaise: 1800,
        reason: "Kirana is ₹18 cheaper and only 4 mins away.",
      }),
    },
  });

  console.log("✅ HIVE Database Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
