export const getAmountColor = (amount: string): string => {
    return amount.startsWith("-") ? "text-red-500" : "text-green-500";
};