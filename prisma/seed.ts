import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "fresh-produce" },
      update: {},
      create: {
        name: "Fresh Produce",
        slug: "fresh-produce",
        description: "Fresh vegetables, fruits, and leafy greens",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "meat-seafood" },
      update: {},
      create: {
        name: "Meat & Seafood",
        slug: "meat-seafood",
        description: "Premium cuts and fresh catches",
        image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "dairy-eggs" },
      update: {},
      create: {
        name: "Dairy & Eggs",
        slug: "dairy-eggs",
        description: "Fresh milk, cheese, and farm eggs",
        image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "pantry" },
      update: {},
      create: {
        name: "Pantry Essentials",
        slug: "pantry",
        description: "Canned goods, sauces, and spices",
        image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "beverages" },
      update: {},
      create: {
        name: "Beverages",
        slug: "beverages",
        description: "Juices, water, and soft drinks",
        image: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "frozen" },
      update: {},
      create: {
        name: "Frozen Foods",
        slug: "frozen",
        description: "Ice cream, frozen meals, and more",
        image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400",
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  const [freshProduce, meatSeafood, dairyEggs, pantry, beverages, frozen] = categories;

  // Helper to create future dates for best before
  const daysFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  // Create Products
  const products = [
    // Fresh Produce (Weight-based)
    {
      name: "Organic Romaine Lettuce",
      slug: "organic-romaine-lettuce",
      description: "Crisp and fresh organic romaine lettuce, perfect for salads and wraps. Grown without pesticides.",
      shortDescription: "Fresh organic lettuce, crisp and healthy",
      price: 85.0,
      compareAtPrice: 95.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 50.0,
      stockUnit: "kg",
      minOrderQty: 0.25,
      weightKg: 0.3,
      bestBefore: daysFromNow(7),
      shelfLifeDays: 7,
      categoryId: freshProduce!.id,
      featured: true,
      tags: ["organic", "salad", "vegetables"],
      images: [
        { url: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800", isPrimary: true },
      ],
    },
    {
      name: "Fresh Tomatoes",
      slug: "fresh-tomatoes",
      description: "Vine-ripened tomatoes with perfect sweetness and acidity. Great for salads, sandwiches, and cooking.",
      shortDescription: "Vine-ripened, naturally sweet tomatoes",
      price: 120.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 100.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(10),
      shelfLifeDays: 10,
      categoryId: freshProduce!.id,
      featured: true,
      tags: ["vegetables", "salad", "cooking"],
      images: [
        { url: "https://images.unsplash.com/photo-1546470427-227c7369a9b0?w=800", isPrimary: true },
      ],
    },
    {
      name: "Organic Carrots",
      slug: "organic-carrots",
      description: "Sweet and crunchy organic carrots. Rich in beta-carotene and perfect for juicing or cooking.",
      shortDescription: "Sweet organic carrots, great for juicing",
      price: 75.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 80.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(14),
      shelfLifeDays: 14,
      categoryId: freshProduce!.id,
      featured: false,
      tags: ["organic", "vegetables", "juicing"],
      images: [
        { url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800", isPrimary: true },
      ],
    },
    {
      name: "Fresh Spinach Bundle",
      slug: "fresh-spinach-bundle",
      description: "Nutrient-rich fresh spinach leaves. Perfect for smoothies, salads, or sautéing.",
      shortDescription: "Nutrient-packed fresh spinach",
      price: 65.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 30.0,
      stockUnit: "kg",
      minOrderQty: 0.2,
      weightKg: 0.2,
      bestBefore: daysFromNow(5),
      shelfLifeDays: 5,
      categoryId: freshProduce!.id,
      featured: true,
      tags: ["vegetables", "leafy-greens", "smoothies"],
      images: [
        { url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800", isPrimary: true },
      ],
    },
    {
      name: "Ripe Mangoes",
      slug: "ripe-mangoes",
      description: "Sweet and juicy Philippine mangoes at perfect ripeness. The sweetest mangoes in the world.",
      shortDescription: "Sweet Philippine mangoes",
      price: 180.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 60.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.35,
      bestBefore: daysFromNow(4),
      shelfLifeDays: 5,
      categoryId: freshProduce!.id,
      featured: true,
      tags: ["fruits", "tropical", "sweet"],
      images: [
        { url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800", isPrimary: true },
      ],
    },

    // Meat & Seafood (Weight-based)
    {
      name: "Premium Beef Ribeye",
      slug: "premium-beef-ribeye",
      description: "USDA Choice grade ribeye steak with perfect marbling. Aged for tenderness and flavor.",
      shortDescription: "USDA Choice ribeye, perfectly marbled",
      price: 850.0,
      compareAtPrice: 950.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 25.0,
      stockUnit: "kg",
      minOrderQty: 0.3,
      weightKg: 0.35,
      bestBefore: daysFromNow(5),
      shelfLifeDays: 5,
      categoryId: meatSeafood!.id,
      featured: true,
      tags: ["beef", "steak", "premium"],
      images: [
        { url: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800", isPrimary: true },
      ],
    },
    {
      name: "Fresh Salmon Fillet",
      slug: "fresh-salmon-fillet",
      description: "Wild-caught Atlantic salmon fillet. Rich in omega-3 fatty acids and perfect for grilling.",
      shortDescription: "Wild-caught Atlantic salmon",
      price: 680.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 20.0,
      stockUnit: "kg",
      minOrderQty: 0.25,
      weightKg: 0.3,
      bestBefore: daysFromNow(3),
      shelfLifeDays: 3,
      categoryId: meatSeafood!.id,
      featured: true,
      tags: ["seafood", "fish", "omega-3"],
      images: [
        { url: "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=800", isPrimary: true },
      ],
    },
    {
      name: "Chicken Breast Boneless",
      slug: "chicken-breast-boneless",
      description: "Lean and tender boneless chicken breast. Perfect for healthy meals and meal prep.",
      shortDescription: "Lean boneless chicken breast",
      price: 280.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 50.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(4),
      shelfLifeDays: 4,
      categoryId: meatSeafood!.id,
      featured: false,
      tags: ["chicken", "lean", "healthy"],
      images: [
        { url: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800", isPrimary: true },
      ],
    },

    // Dairy & Eggs (Unit-based)
    {
      name: "Farm Fresh Eggs (Dozen)",
      slug: "farm-fresh-eggs-dozen",
      description: "Free-range eggs from local farms. Rich golden yolks and superior taste.",
      shortDescription: "Free-range eggs, golden yolks",
      price: 180.0,
      stockType: "UNIT" as const,
      stockQuantity: 100,
      stockUnit: "dozen",
      minOrderQty: 1,
      weightKg: 0.7,
      bestBefore: daysFromNow(21),
      shelfLifeDays: 21,
      categoryId: dairyEggs!.id,
      featured: true,
      tags: ["eggs", "free-range", "breakfast"],
      images: [
        { url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800", isPrimary: true },
      ],
    },
    {
      name: "Fresh Whole Milk (1L)",
      slug: "fresh-whole-milk-1l",
      description: "Creamy whole milk from grass-fed cows. Pasteurized for safety while retaining nutrients.",
      shortDescription: "Creamy grass-fed whole milk",
      price: 95.0,
      stockType: "UNIT" as const,
      stockQuantity: 80,
      stockUnit: "bottle",
      minOrderQty: 1,
      weightKg: 1.03,
      bestBefore: daysFromNow(10),
      shelfLifeDays: 10,
      categoryId: dairyEggs!.id,
      featured: false,
      tags: ["milk", "dairy", "grass-fed"],
      images: [
        { url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800", isPrimary: true },
      ],
    },
    {
      name: "Artisan Cheddar Cheese",
      slug: "artisan-cheddar-cheese",
      description: "Aged artisan cheddar with sharp, complex flavors. Perfect for cheese boards and cooking.",
      shortDescription: "Sharp aged artisan cheddar",
      price: 320.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 15.0,
      stockUnit: "kg",
      minOrderQty: 0.2,
      weightKg: 0.25,
      bestBefore: daysFromNow(60),
      shelfLifeDays: 60,
      categoryId: dairyEggs!.id,
      featured: true,
      tags: ["cheese", "cheddar", "artisan"],
      images: [
        { url: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=800", isPrimary: true },
      ],
    },

    // Pantry (Unit-based)
    {
      name: "Extra Virgin Olive Oil (500ml)",
      slug: "extra-virgin-olive-oil-500ml",
      description: "Cold-pressed extra virgin olive oil from Mediterranean olives. Perfect for cooking and dressings.",
      shortDescription: "Premium cold-pressed olive oil",
      price: 450.0,
      stockType: "UNIT" as const,
      stockQuantity: 50,
      stockUnit: "bottle",
      minOrderQty: 1,
      weightKg: 0.5,
      bestBefore: daysFromNow(365),
      shelfLifeDays: 365,
      categoryId: pantry!.id,
      featured: false,
      tags: ["oil", "cooking", "mediterranean"],
      images: [
        { url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800", isPrimary: true },
      ],
    },
    {
      name: "Organic Honey (350g)",
      slug: "organic-honey-350g",
      description: "Pure organic wildflower honey. Raw and unfiltered for maximum health benefits.",
      shortDescription: "Pure raw organic honey",
      price: 280.0,
      stockType: "UNIT" as const,
      stockQuantity: 40,
      stockUnit: "jar",
      minOrderQty: 1,
      weightKg: 0.4,
      bestBefore: daysFromNow(730),
      shelfLifeDays: 730,
      categoryId: pantry!.id,
      featured: true,
      tags: ["honey", "organic", "sweetener"],
      images: [
        { url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800", isPrimary: true },
      ],
    },

    // Beverages (Unit-based)
    {
      name: "Fresh Orange Juice (1L)",
      slug: "fresh-orange-juice-1l",
      description: "Freshly squeezed orange juice with no added sugar. Made from premium Valencia oranges.",
      shortDescription: "Freshly squeezed, no added sugar",
      price: 150.0,
      stockType: "UNIT" as const,
      stockQuantity: 60,
      stockUnit: "bottle",
      minOrderQty: 1,
      weightKg: 1.05,
      bestBefore: daysFromNow(7),
      shelfLifeDays: 7,
      categoryId: beverages!.id,
      featured: true,
      tags: ["juice", "fresh", "vitamin-c"],
      images: [
        { url: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800", isPrimary: true },
      ],
    },
    {
      name: "Coconut Water (500ml)",
      slug: "coconut-water-500ml",
      description: "100% pure young coconut water. Natural electrolytes for hydration.",
      shortDescription: "Pure young coconut water",
      price: 75.0,
      stockType: "UNIT" as const,
      stockQuantity: 100,
      stockUnit: "bottle",
      minOrderQty: 1,
      weightKg: 0.52,
      bestBefore: daysFromNow(30),
      shelfLifeDays: 30,
      categoryId: beverages!.id,
      featured: false,
      tags: ["coconut", "hydration", "electrolytes"],
      images: [
        { url: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800", isPrimary: true },
      ],
    },

    // Frozen (Unit-based)
    {
      name: "Premium Vanilla Ice Cream (1 pint)",
      slug: "premium-vanilla-ice-cream",
      description: "Rich and creamy vanilla ice cream made with real Madagascar vanilla beans.",
      shortDescription: "Creamy Madagascar vanilla ice cream",
      price: 220.0,
      stockType: "UNIT" as const,
      stockQuantity: 30,
      stockUnit: "pint",
      minOrderQty: 1,
      weightKg: 0.5,
      bestBefore: daysFromNow(180),
      shelfLifeDays: 180,
      categoryId: frozen!.id,
      featured: false,
      tags: ["ice-cream", "dessert", "vanilla"],
      images: [
        { url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800", isPrimary: true },
      ],
    },
    {
      name: "Frozen Mixed Berries (500g)",
      slug: "frozen-mixed-berries",
      description: "Premium frozen mixed berries including strawberries, blueberries, and raspberries. Perfect for smoothies.",
      shortDescription: "Premium frozen berry mix",
      price: 180.0,
      stockType: "UNIT" as const,
      stockQuantity: 45,
      stockUnit: "pack",
      minOrderQty: 1,
      weightKg: 0.5,
      bestBefore: daysFromNow(365),
      shelfLifeDays: 365,
      categoryId: frozen!.id,
      featured: true,
      tags: ["berries", "smoothies", "antioxidants"],
      images: [
        { url: "https://images.unsplash.com/photo-1596591868231-05e908752cc1?w=800", isPrimary: true },
      ],
    },
  ];

  // Create products with images
  for (const productData of products) {
    const { images, ...product } = productData;

    const createdProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });

    // Create images for the product
    for (const image of images) {
      await prisma.productImage.upsert({
        where: {
          id: `${createdProduct.id}-${image.isPrimary ? "primary" : "secondary"}`,
        },
        update: {},
        create: {
          id: `${createdProduct.id}-${image.isPrimary ? "primary" : "secondary"}`,
          url: image.url,
          isPrimary: image.isPrimary,
          productId: createdProduct.id,
        },
      });
    }
  }

  console.log(`✅ Created ${products.length} products`);

  // Create shipping zones and rates
  const defaultZone = await prisma.shippingZone.upsert({
    where: { id: "default-zone" },
    update: {},
    create: {
      id: "default-zone",
      name: "Metro Manila",
    },
  });

  await Promise.all([
    prisma.shippingRate.upsert({
      where: { id: "standard-0-5" },
      update: {},
      create: {
        id: "standard-0-5",
        zoneId: defaultZone.id,
        name: "Standard Delivery",
        minWeightKg: 0,
        maxWeightKg: 5,
        basePrice: 50,
        pricePerKg: 15,
        estimatedDays: 3,
      },
    }),
    prisma.shippingRate.upsert({
      where: { id: "standard-5-15" },
      update: {},
      create: {
        id: "standard-5-15",
        zoneId: defaultZone.id,
        name: "Standard Delivery",
        minWeightKg: 5,
        maxWeightKg: 15,
        basePrice: 75,
        pricePerKg: 12,
        estimatedDays: 3,
      },
    }),
    prisma.shippingRate.upsert({
      where: { id: "express-0-10" },
      update: {},
      create: {
        id: "express-0-10",
        zoneId: defaultZone.id,
        name: "Express Delivery",
        minWeightKg: 0,
        maxWeightKg: 10,
        basePrice: 150,
        pricePerKg: 25,
        estimatedDays: 1,
      },
    }),
  ]);

  console.log("✅ Created shipping zones and rates");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
