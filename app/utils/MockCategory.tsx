export interface ICategory {
    id: number;
    name: string;
}

export const mockCategories: ICategory[] = [
    {
        id: 1,
        name: "Di chuyển"
    },
    {
        id: 2,
        name: "Ăn uống"
    },
    {
        id: 3,
        name: "Tiền điện"
    },
    {
        id: 4,
        name: "Tiền nước"
    },
    {
        id: 5,
        name: "Mua sắm"
    },
    {
        id: 6,
        name: "Học tập"
    },
    {
        id: 7,
        name: "Giải trí"
    },
    {
        id: 8,
        name: "Thu nhập"
    },
    {
        id: 9,
        name: "Thuê nhà"
    },
    {
        id: 10,
        name: "Internet"
    },
    {
        id: 11,
        name: "Khác"
    }
];

/**
 * Utility function to get a category by ID
 */
export const getCategoryById = (id: number): ICategory | undefined => {
    return mockCategories.find(category => category.id === id);
};

/**
 * Utility function to get a category by name
 */
export const getCategoryByName = (name: string): ICategory | undefined => {
    return mockCategories.find(category => category.name === name);
};