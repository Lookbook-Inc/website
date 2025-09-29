export interface ClothingItem {
  id: string;
  name: string;
  category: string;
  color: string;
  imageSrc: string;
  confidence: number;
}

export interface OutfitExample {
  id: string;
  name: string;
  description: string;
  outfitImage: string;
  items: ClothingItem[];
}

export const outfitExamples: OutfitExample[] = [
  {
    id: "outfit-1",
    name: "Chic Autumn Look",
    description: "Sophisticated fall outfit with layered textures",
    outfitImage: "/images/generation-graphics/outfit-1/outfit-1.jpg",
    items: [
      {
        id: "outfit-1-jacket",
        name: "Tailored Jacket",
        category: "Outerwear",
        color: "Roasted Pecan",
        imageSrc: "/images/generation-graphics/outfit-1/outfit-1-jacket.webp",
        confidence: 91
      },
      {
        id: "outfit-1-sweater",
        name: "Cozy Knit Sweater",
        category: "Top",
        color: "Juniper Green",
        imageSrc: "/images/generation-graphics/outfit-1/outfit-1-sweater.webp",
        confidence: 94
      },
      {
        id: "outfit-1-skirt",
        name: "Mini Skirt",
        category: "Bottoms",
        color: "Juniper Green",
        imageSrc: "/images/generation-graphics/outfit-1/outfit-1-skirt.webp",
        confidence: 89
      },
      {
        id: "outfit-1-shoes",
        name: "Ankle Boots",
        category: "Footwear",
        color: "Tobacco",
        imageSrc: "/images/generation-graphics/outfit-1/outfit-1-shoes.webp",
        confidence: 96
      }
    ]
  },
  {
    id: "outfit-2",
    name: "Casual Street Style",
    description: "Relaxed urban look with layered pieces",
    outfitImage: "/images/generation-graphics/outfit-2/outfit-2.jpg",
    items: [
      {
        id: "outfit-2-hat",
        name: "Baseball Cap",
        category: "Hats",
        color: "Charcoal",
        imageSrc: "/images/generation-graphics/outfit-2/outfit-2-hat.webp",
        confidence: 92
      },
      {
        id: "outfit-2-sweater",
        name: "Oversized Windbreak Sweater",
        category: "Top",
        color: "Charcoal, Meringue White, Forest Green",
        imageSrc: "/images/generation-graphics/outfit-2/outfit-2-sweater.webp",
        confidence: 95
      },
      {
        id: "outfit-2-pants",
        name: "Cargo Jeans",
        category: "Bottoms",
        color: "Onyx",
        imageSrc: "/images/generation-graphics/outfit-2/outfit-2-pants.webp",
        confidence: 88
      }
    ]
  },
  {
    id: "outfit-3",
    name: "Bold Athletic Set",
    description: "Vibrant yellow tracksuit perfect for active days",
    outfitImage: "/images/generation-graphics/outfit-3/outfit-3.jpg",
    items: [
      {
        id: "outfit-3-hoodie",
        name: "Cropped Hoodie",
        category: "Top",
        color: "Golden Yellow",
        imageSrc: "/images/generation-graphics/outfit-3/outfit-3-hoodie.webp",
        confidence: 93
      },
      {
        id: "outfit-3-pants",
        name: "Sweatpants",
        category: "Bottoms",
        color: "Golden Yellow",
        imageSrc: "/images/generation-graphics/outfit-3/outfit-3-pants.webp",
        confidence: 91
      },
      {
        id: "outfit-3-shoes",
        name: "Ankle Boots",
        category: "Footwear",
        color: "Sugar White",
        imageSrc: "/images/generation-graphics/outfit-3/outfit-3_shoes.webp",
        confidence: 87
      }
    ]
  },
  {
    id: "outfit-4",
    name: "Retro Neon Vibes",
    description: "90s-inspired look with bold stripes and vintage flair",
    outfitImage: "/images/generation-graphics/outfit-4/outfit-4.jpg",
    items: [
      {
        id: "outfit-4-t-shirt",
        name: "Tank Top",
        category: "Top",
        color: "Meringue",
        imageSrc: "/images/generation-graphics/outfit-4/outfit-4-t-shirt.webp",
        confidence: 89
      },
      {
        id: "outfit-4-pants",
        name: "Wide-Leg Striped Pants",
        category: "Bottoms",
        color: "White, Black",
        imageSrc: "/images/generation-graphics/outfit-4/outfit-4-pants.webp",
        confidence: 95
      },
      {
        id: "outfit-4-purse",
        name: "Mini Handbag",
        category: "Accessories",
        color: "Cherry Red",
        imageSrc: "/images/generation-graphics/outfit-4/outfit-4-purse.webp",
        confidence: 92
      },
      {
        id: "outfit-4-shoes",
        name: "Platform Sneakers",
        category: "Footwear",
        color: "White",
        imageSrc: "/images/generation-graphics/outfit-4/outfit-4-shoes.webp",
        confidence: 88
      }
    ]
  },
  {
    id: "outfit-5",
    name: "Elegant Winter Layers",
    description: "Sophisticated winter ensemble with luxury textures",
    outfitImage: "/images/generation-graphics/outfit-5/outfit-5.jpg",
    items: [
      {
        id: "outfit-5-jacket",
        name: "Wool Coat",
        category: "Outerwear",
        color: "Dusty Rose",
        imageSrc: "/images/generation-graphics/outfit-5/outfit-5-jacket.webp",
        confidence: 96
      },
      {
        id: "outfit-5-scarf",
        name: "Paisley Scarf",
        category: "Accessories",
        color: "Coffee Brown",
        imageSrc: "/images/generation-graphics/outfit-5/outfit-5-scarf.webp",
        confidence: 94
      },
      {
        id: "outfit-5-pants",
        name: "Leggings",
        category: "Bottoms",
        color: "Midnight Black",
        imageSrc: "/images/generation-graphics/outfit-5/outfit-5-pants.webp",
        confidence: 90
      },
      {
        id: "outfit-5-shoes",
        name: "Dress Boots",
        category: "Footwear",
        color: "Black",
        imageSrc: "/images/generation-graphics/outfit-5/outfit-5-shoes.webp",
        confidence: 92
      }
    ]
  },
  {
    id: "outfit-6",
    name: "Smart Casual Ensemble",
    description: "Classic business casual look with modern touches",
    outfitImage: "/images/generation-graphics/outfit-6/outfit-7.jpg",
    items: [
      {
        id: "outfit-6-shirt",
        name: "Cropped White Top",
        category: "Top",
        color: "Crisp White",
        imageSrc: "/images/generation-graphics/outfit-6/outfit-7-shirt.webp",
        confidence: 94
      },
      {
        id: "outfit-6-pants",
        name: "Green Relaxed Sweatpants",
        category: "Bottoms",
        color: "Satin Moss",
        imageSrc: "/images/generation-graphics/outfit-6/outfit-7-pants.webp",
        confidence: 92
      },
      {
        id: "outfit-6-shoes",
        name: "Low Top Skate Shoes",
        category: "Footwear",
        color: "White",
        imageSrc: "/images/generation-graphics/outfit-6/outfit-7-shoes.webp",
        confidence: 90
      }
    ]
  }
];