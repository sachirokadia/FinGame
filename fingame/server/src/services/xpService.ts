export function calculateXpForExpense(category: string): number {
  const normalizedCategory = category.toLowerCase().trim();

  if (normalizedCategory.includes("🍔") || normalizedCategory.includes("food") || normalizedCategory.includes("dining")) {
    return 5;
  } else if (normalizedCategory.includes("☕") || normalizedCategory.includes("coffee") || normalizedCategory.includes("potion")) {
    return 2;
  } else if (normalizedCategory.includes("🚗") || normalizedCategory.includes("transport") || normalizedCategory.includes("travel")) {
    return 8;
  } else if (normalizedCategory.includes("🛍️") || normalizedCategory.includes("shopping")) {
    return 5;
  } else if (normalizedCategory.includes("⚡") || normalizedCategory.includes("utilities") || normalizedCategory.includes("utility")) {
    return 10;
  } else if (normalizedCategory.includes("🎮") || normalizedCategory.includes("gaming")) {
    return 4;
  }
  return 3; // default XP
}

export function calculateLevel(xp: number): { level: number; xpInCurrentLevel: number; xpForNextLevel: number } {
  const levelXpRequirement = 500;
  const level = Math.floor(xp / levelXpRequirement) + 1;
  const xpInCurrentLevel = xp % levelXpRequirement;
  
  return {
    level,
    xpInCurrentLevel,
    xpForNextLevel: levelXpRequirement,
  };
}
