// services/loyaltyService.js
class LoyaltyService {
  static calculatePointsEarned(finalPrice, vehicleType) {
    // Base points: 1 point per R10 spent
    let basePoints = Math.floor(finalPrice / 10);
    
    // Bonus points based on vehicle type
    const vehicleBonuses = {
      '4 Seater Sedan': 50,
      'Mini Bus Mercedes Viano': 100,
      '15 Seater Quantum': 150,
      '17 Seater Luxury Sprinter': 200,
      '22 Seater Luxury Coach': 300,
      '28 Seater Luxury Coach': 400,
      '39 Seater Luxury Coach': 500,
      '60 Seater Semi Luxury': 600,
      '70 Seater Semi Luxury': 700
    };
    
    const vehicleBonus = vehicleBonuses[vehicleType] || 0;
    
    return basePoints + vehicleBonus;
  }

  static calculateDiscount(points) {
    // 100 points = R10 discount, max 50% discount
    const discountAmount = Math.floor(points / 100) * 10;
    return Math.min(discountAmount, 500); // Max R500 discount
  }

  static getTierBenefits(tier) {
    const benefits = {
      bronze: { discountRate: 0, priority: 1, name: 'Bronze' },
      silver: { discountRate: 5, priority: 2, name: 'Silver' },
      gold: { discountRate: 10, priority: 3, name: 'Gold' },
      platinum: { discountRate: 15, priority: 4, name: 'Platinum' }
    };
    return benefits[tier] || benefits.bronze;
  }
}

module.exports = LoyaltyService;