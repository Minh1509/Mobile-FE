export const getCategoryIcon = (category: string): { imageSource: any } => {
    switch (category) {
        case "Di chuyển":
            return { imageSource: require("@/assets/icons/car.png") };
        case "Ăn uống":
            return { imageSource: require("@/assets/icons/salad.png") };
        case "Tiền điện":
            return { imageSource: require("@/assets/icons/energy.png") };
        case "Tiền nước":
            return { imageSource: require("@/assets/icons/drink-water.png") };
        case "Mua sắm":
            return { imageSource: require("@/assets/icons/shopping.png") };
        case "Học tập":
            return { imageSource: require("@/assets/icons/learning.png") };
        case "Giải trí":
            return { imageSource: require("@/assets/icons/game.png") };
        case "Thu nhập":
            return { imageSource: require("@/assets/icons/money-bag.png") };
        case "Thuê nhà":
            return { imageSource: require("@/assets/icons/house.png") };
        case "Internet":
            return { imageSource: require("@/assets/icons/wifi.png") };
        default:
            return { imageSource: require("@/assets/icons/other.png") };
    }
}