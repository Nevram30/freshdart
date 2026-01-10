import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Categories for Fresh Fish & Shrimps
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "fresh-fish" },
      update: {},
      create: {
        name: "Fresh Fish",
        slug: "fresh-fish",
        description: "Daily fresh catch from local waters",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "shrimps-prawns" },
      update: {},
      create: {
        name: "Shrimps & Prawns",
        slug: "shrimps-prawns",
        description: "Premium quality shrimps and prawns",
        image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "crabs-shellfish" },
      update: {},
      create: {
        name: "Crabs & Shellfish",
        slug: "crabs-shellfish",
        description: "Fresh crabs, mussels, and shellfish",
        image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "dried-smoked" },
      update: {},
      create: {
        name: "Dried & Smoked",
        slug: "dried-smoked",
        description: "Traditional dried and smoked seafood",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "frozen-seafood" },
      update: {},
      create: {
        name: "Frozen Seafood",
        slug: "frozen-seafood",
        description: "Flash-frozen for lasting freshness",
        image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400",
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  const [freshFish, shrimpsPrawns, crabsShellfish, driedSmoked, frozenSeafood] =
    categories;

  // Helper to create future dates for best before
  const daysFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  // Create Products - Fresh Fish & Shrimps
  const products = [
    // Fresh Fish
    {
      name: "Atlantic Salmon",
      slug: "atlantic-salmon",
      description:
        "Direct from Norway cold waters, delivered within 24 hours. Premium quality Atlantic salmon with rich, buttery flavor perfect for sashimi or grilling.",
      shortDescription: "Fresh from Norway cold waters",
      price: 850.0,
      compareAtPrice: 950.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 50.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(3),
      shelfLifeDays: 3,
      categoryId: freshFish!.id,
      featured: true,
      tags: ["fresh-catch", "salmon", "premium", "sashimi-grade"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Wild Seabass",
      slug: "wild-seabass",
      description:
        "Sustainably line-caught wild seabass from Philippine waters. Perfect for gourmet grilling with delicate, flaky white meat.",
      shortDescription: "Sustainably line-caught seabass",
      price: 620.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 30.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.8,
      bestBefore: daysFromNow(2),
      shelfLifeDays: 2,
      categoryId: freshFish!.id,
      featured: true,
      tags: ["fresh-catch", "seabass", "sustainable", "gourmet"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Fresh Bangus (Milkfish)",
      slug: "fresh-bangus",
      description:
        "Premium boneless bangus from Dagupan. The national fish of the Philippines, perfect for sinigang or grilling.",
      shortDescription: "Premium Dagupan milkfish",
      price: 320.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 80.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.6,
      bestBefore: daysFromNow(2),
      shelfLifeDays: 2,
      categoryId: freshFish!.id,
      featured: true,
      tags: ["bangus", "milkfish", "local", "boneless"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Fresh Tilapia",
      slug: "fresh-tilapia",
      description:
        "Farm-raised tilapia from clean freshwater ponds. Mild, sweet flavor ideal for everyday cooking.",
      shortDescription: "Farm-fresh tilapia",
      price: 180.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 100.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.4,
      bestBefore: daysFromNow(2),
      shelfLifeDays: 2,
      categoryId: freshFish!.id,
      featured: false,
      tags: ["tilapia", "freshwater", "affordable"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Fresh Tuna Belly",
      slug: "fresh-tuna-belly",
      description:
        "Premium tuna belly from General Santos. Rich, fatty cut perfect for grilling or making kinilaw.",
      shortDescription: "Premium GenSan tuna belly",
      price: 580.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 25.0,
      stockUnit: "kg",
      minOrderQty: 0.3,
      weightKg: 0.5,
      bestBefore: daysFromNow(2),
      shelfLifeDays: 2,
      categoryId: freshFish!.id,
      featured: true,
      tags: ["tuna", "belly", "premium", "gensan"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Fresh Lapu-Lapu (Grouper)",
      slug: "fresh-lapu-lapu",
      description:
        "Wild-caught lapu-lapu, a prized fish for special occasions. Sweet, firm flesh perfect for steaming or escabeche.",
      shortDescription: "Wild-caught grouper",
      price: 750.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 20.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 1.0,
      bestBefore: daysFromNow(2),
      shelfLifeDays: 2,
      categoryId: freshFish!.id,
      featured: true,
      tags: ["lapu-lapu", "grouper", "premium", "special-occasion"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Fresh Galunggong (Round Scad)",
      slug: "fresh-galunggong",
      description:
        "The everyday Filipino fish favorite. Affordable and nutritious, perfect for frying or paksiw.",
      shortDescription: "Everyday Filipino favorite",
      price: 150.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 150.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.3,
      bestBefore: daysFromNow(2),
      shelfLifeDays: 2,
      categoryId: freshFish!.id,
      featured: false,
      tags: ["galunggong", "affordable", "local"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=800",
          isPrimary: true,
        },
      ],
    },

    // Shrimps & Prawns
    {
      name: "Tiger Prawns XL",
      slug: "tiger-prawns-xl",
      description:
        "Premium grade XL tiger prawns, perfect for restaurants and special occasions. Sweet, firm texture with impressive size.",
      shortDescription: "Premium XL tiger prawns",
      price: 950.0,
      compareAtPrice: 1100.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 40.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(2),
      shelfLifeDays: 2,
      categoryId: shrimpsPrawns!.id,
      featured: true,
      tags: ["prawns", "tiger-prawns", "xl", "premium"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Suahe (White Shrimp)",
      slug: "suahe-white-shrimp",
      description:
        "Fresh white shrimps perfect for sinigang, pancit, and everyday cooking. Sweet and tender.",
      shortDescription: "Fresh white shrimps",
      price: 480.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 60.0,
      stockUnit: "kg",
      minOrderQty: 0.25,
      weightKg: 0.25,
      bestBefore: daysFromNow(2),
      shelfLifeDays: 2,
      categoryId: shrimpsPrawns!.id,
      featured: true,
      tags: ["suahe", "white-shrimp", "cooking"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1623855244183-52fd8d3ce2f7?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Hipon Puti (Small Shrimp)",
      slug: "hipon-puti",
      description:
        "Small fresh shrimps ideal for making bagoong, okoy, or shrimp paste. Sourced from local fishermen.",
      shortDescription: "Small shrimps for bagoong/okoy",
      price: 280.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 50.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(1),
      shelfLifeDays: 1,
      categoryId: shrimpsPrawns!.id,
      featured: false,
      tags: ["small-shrimp", "bagoong", "okoy"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Lobster Tails",
      slug: "lobster-tails",
      description:
        "Premium lobster tails, flash-frozen at sea to lock in freshness. Luxurious treat perfect for special occasions.",
      shortDescription: "Premium frozen lobster tails",
      price: 1800.0,
      stockType: "UNIT" as const,
      stockQuantity: 30,
      stockUnit: "pc",
      minOrderQty: 1,
      weightKg: 0.3,
      bestBefore: daysFromNow(90),
      shelfLifeDays: 90,
      categoryId: shrimpsPrawns!.id,
      featured: true,
      tags: ["lobster", "premium", "special-occasion"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Giant River Prawns",
      slug: "giant-river-prawns",
      description:
        "Ulang or giant freshwater prawns. Prized for their sweet meat and impressive size. Perfect for grilling.",
      shortDescription: "Giant freshwater prawns",
      price: 1200.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 15.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(1),
      shelfLifeDays: 1,
      categoryId: shrimpsPrawns!.id,
      featured: true,
      tags: ["ulang", "river-prawns", "premium", "grilling"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800",
          isPrimary: true,
        },
      ],
    },

    // Crabs & Shellfish
    {
      name: "Alimango (Mud Crab)",
      slug: "alimango-mud-crab",
      description:
        "Live mud crabs with full roe. The ultimate Filipino seafood delicacy, perfect for crab in chili or steamed.",
      shortDescription: "Live mud crabs with roe",
      price: 1100.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 20.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(1),
      shelfLifeDays: 1,
      categoryId: crabsShellfish!.id,
      featured: true,
      tags: ["alimango", "crab", "live", "premium"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1550747545-c896b247d808?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Alimasag (Blue Crab)",
      slug: "alimasag-blue-crab",
      description:
        "Fresh blue swimming crabs. Sweet, delicate meat perfect for crab soup or ginataang alimasag.",
      shortDescription: "Fresh blue swimming crabs",
      price: 450.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 35.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(1),
      shelfLifeDays: 1,
      categoryId: crabsShellfish!.id,
      featured: true,
      tags: ["alimasag", "blue-crab", "soup"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1580820267682-426da823b514?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Fresh Mussels (Tahong)",
      slug: "fresh-mussels-tahong",
      description:
        "Farm-fresh green mussels from Cavite. Perfect for adobong tahong or baked with cheese and garlic.",
      shortDescription: "Fresh Cavite mussels",
      price: 180.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 80.0,
      stockUnit: "kg",
      minOrderQty: 1,
      weightKg: 1.0,
      bestBefore: daysFromNow(2),
      shelfLifeDays: 2,
      categoryId: crabsShellfish!.id,
      featured: false,
      tags: ["tahong", "mussels", "shellfish"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Fresh Oysters (Talaba)",
      slug: "fresh-oysters-talaba",
      description:
        "Fresh oysters harvested from clean waters. Enjoy raw with calamansi or grilled with butter.",
      shortDescription: "Fresh raw oysters",
      price: 220.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 50.0,
      stockUnit: "kg",
      minOrderQty: 1,
      weightKg: 1.0,
      bestBefore: daysFromNow(2),
      shelfLifeDays: 2,
      categoryId: crabsShellfish!.id,
      featured: true,
      tags: ["talaba", "oysters", "raw"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1606735585197-ee77c2b2cb55?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Fresh Squid (Pusit)",
      slug: "fresh-squid-pusit",
      description:
        "Fresh squid perfect for adobong pusit, grilling, or calamares. Cleaned and ready to cook.",
      shortDescription: "Fresh cleaned squid",
      price: 380.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 40.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(2),
      shelfLifeDays: 2,
      categoryId: crabsShellfish!.id,
      featured: true,
      tags: ["pusit", "squid", "adobo", "calamares"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1545831913-95eb0a68c204?w=800",
          isPrimary: true,
        },
      ],
    },

    // Dried & Smoked
    {
      name: "Dried Dilis (Anchovies)",
      slug: "dried-dilis",
      description:
        "Sun-dried anchovies, a Filipino pantry staple. Perfect for frying as crispy snack or cooking with vegetables.",
      shortDescription: "Sun-dried anchovies",
      price: 350.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 30.0,
      stockUnit: "kg",
      minOrderQty: 0.25,
      weightKg: 0.25,
      bestBefore: daysFromNow(90),
      shelfLifeDays: 90,
      categoryId: driedSmoked!.id,
      featured: true,
      tags: ["dilis", "dried", "anchovies"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Smoked Tinapa (Smoked Fish)",
      slug: "smoked-tinapa",
      description:
        "Traditional wood-smoked fish with rich, savory flavor. Ready to eat or perfect for tinapa rice.",
      shortDescription: "Traditional smoked fish",
      price: 280.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 25.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(7),
      shelfLifeDays: 7,
      categoryId: driedSmoked!.id,
      featured: true,
      tags: ["tinapa", "smoked", "traditional"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Dried Tuyo (Salted Fish)",
      slug: "dried-tuyo",
      description:
        "Classic Filipino breakfast staple. Salt-cured and sun-dried, best enjoyed with garlic rice and eggs.",
      shortDescription: "Classic salted dried fish",
      price: 320.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 20.0,
      stockUnit: "kg",
      minOrderQty: 0.25,
      weightKg: 0.25,
      bestBefore: daysFromNow(60),
      shelfLifeDays: 60,
      categoryId: driedSmoked!.id,
      featured: false,
      tags: ["tuyo", "dried", "breakfast"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1606735585197-ee77c2b2cb55?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Dried Shrimp (Hibi)",
      slug: "dried-shrimp-hibi",
      description:
        "Dried baby shrimps for cooking. Essential ingredient for pancit, okoy, and many Filipino dishes.",
      shortDescription: "Dried baby shrimps",
      price: 450.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 15.0,
      stockUnit: "kg",
      minOrderQty: 0.25,
      weightKg: 0.25,
      bestBefore: daysFromNow(120),
      shelfLifeDays: 120,
      categoryId: driedSmoked!.id,
      featured: true,
      tags: ["hibi", "dried-shrimp", "cooking"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?w=800",
          isPrimary: true,
        },
      ],
    },

    // Frozen Seafood
    {
      name: "Frozen Cream Dory Fillet",
      slug: "frozen-cream-dory",
      description:
        "Premium cream dory fillets, individually frozen. Mild flavor perfect for kids and easy weeknight meals.",
      shortDescription: "Frozen cream dory fillets",
      price: 380.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 60.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(180),
      shelfLifeDays: 180,
      categoryId: frozenSeafood!.id,
      featured: true,
      tags: ["cream-dory", "frozen", "fillet"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Frozen Shrimp (Peeled & Deveined)",
      slug: "frozen-shrimp-pd",
      description:
        "Convenient peeled and deveined shrimps. Ready to cook for quick and easy meals.",
      shortDescription: "Ready-to-cook frozen shrimps",
      price: 650.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 40.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(180),
      shelfLifeDays: 180,
      categoryId: frozenSeafood!.id,
      featured: true,
      tags: ["shrimp", "frozen", "peeled", "convenient"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Frozen Salmon Belly",
      slug: "frozen-salmon-belly",
      description:
        "Premium salmon belly portions, rich in omega-3. Perfect for grilling or pan-frying.",
      shortDescription: "Frozen salmon belly cuts",
      price: 720.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 30.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(180),
      shelfLifeDays: 180,
      categoryId: frozenSeafood!.id,
      featured: true,
      tags: ["salmon", "belly", "frozen", "omega-3"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=800",
          isPrimary: true,
        },
      ],
    },
    {
      name: "Frozen Squid Rings",
      slug: "frozen-squid-rings",
      description:
        "Pre-cut squid rings ready for calamares. Just bread and fry for crispy perfection.",
      shortDescription: "Ready-to-fry squid rings",
      price: 420.0,
      stockType: "WEIGHT" as const,
      stockQuantity: 35.0,
      stockUnit: "kg",
      minOrderQty: 0.5,
      weightKg: 0.5,
      bestBefore: daysFromNow(180),
      shelfLifeDays: 180,
      categoryId: frozenSeafood!.id,
      featured: false,
      tags: ["squid", "rings", "frozen", "calamares"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1545831913-95eb0a68c204?w=800",
          isPrimary: true,
        },
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
