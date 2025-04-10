declare module 'react-native-get-sms-android' {
    export interface SmsFilter {
        box?: 'inbox' | 'sent' | 'draft' | 'outbox' | 'failed' | 'queued' | 'all';
        indexFrom?: number;
        maxCount?: number;
        address?: string;
        body?: string;
        read?: 0 | 1;
        _id?: string;
        thread_id?: string;
    }

    export interface SmsMessage {
        _id: string;
        thread_id: string;
        address: string;
        body: string;
        date: number;
        date_sent: number;
        read: number;
        status: number;
        type: number;
        service_center: string;
    }

    /**
     * Lấy danh sách SMS theo bộ lọc
     * @param filter Chuỗi JSON chứa các tùy chọn lọc
     * @param failCallback Hàm callback khi thất bại
     * @param successCallback Hàm callback khi thành công, nhận số lượng SMS và chuỗi JSON danh sách SMS
     */
    export function list(
        filter: string,
        failCallback: (fail: string) => void,
        successCallback: (count: number, smsList: string) => void
    ): void;

    /**
     * Gửi tin nhắn SMS
     * @param phoneNumber Số điện thoại nhận
     * @param message Nội dung tin nhắn
     * @param successCallback Hàm callback khi gửi thành công
     * @param failCallback Hàm callback khi gửi thất bại
     */
    export function send(
        phoneNumber: string,
        message: string,
        successCallback: () => void,
        failCallback: (error: string) => void
    ): void;

    /**
     * Xóa tin nhắn SMS
     * @param messageId ID tin nhắn cần xóa
     * @param successCallback Hàm callback khi xóa thành công
     * @param failCallback Hàm callback khi xóa thất bại
     */
    export function deleteMessage(
        messageId: string,
        successCallback: () => void,
        failCallback: (error: string) => void
    ): void;

    const SmsAndroid: {
        list: typeof list;
        send: typeof send;
        deleteMessage: typeof deleteMessage;
    };

    export default SmsAndroid;
}