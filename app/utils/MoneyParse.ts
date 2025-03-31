const VNDFormat = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VND';
};

const VNDKFormat = (amount: number) => {
    return (amount / 1000).toLocaleString('vi-VN') + 'K VND';
};

export { VNDFormat, VNDKFormat };

