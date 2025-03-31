export const normalizeDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
};

export const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng tính từ 0-11 nên phải +1
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};