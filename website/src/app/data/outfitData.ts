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
  }
];