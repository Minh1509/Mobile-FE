import { PermissionsAndroid, Platform } from 'react-native';
import SmsAndroid, { SmsMessage } from 'react-native-get-sms-android';
import { ParsedSms } from '../interface/Sms';

const supportedBanks = ['TPBank', 'VietcomBank', 'VCB', 'TCB', 'TPB'];

export const parseSMS = (message: SmsMessage): ParsedSms | null => {
    const bankIndex = supportedBanks.findIndex(bank =>
        message.address?.includes(bank) || message.body?.includes(bank)
    );

    if (bankIndex === -1) return null;
    const bankName = supportedBanks[bankIndex];

    const accountMatch = message.body.match(/TK[:\s]*(?:(?:\*\*\*\*|\w+)(\d{4,6})|((?:\d{4}[\s-]?){1,4}))/i);
    const amountMatch = message.body.match(/(?:PS|SD|GD|So tien|so du)[:\s]*([-+])?([\d,.]+)(?:\s?VND)?/i);
    const descMatch = message.body.match(/(?:ND|NDT|Mo ta|Noi dung)[:\s]*(.+?)(?:\.|,|\n|$)/i);
    const timeMatch = message.body.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
    const dateMatch = message.body.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);

    let transactionType: 'income' | 'expense' | null = null;
    if (amountMatch) {
        transactionType = amountMatch[1] === '-' ? 'expense' : 'income';
    } else if (message.body.toLowerCase().includes('nhận tiền') || message.body.toLowerCase().includes('credited')) {
        transactionType = 'income';
    } else if (message.body.toLowerCase().includes('chi tiêu') || message.body.toLowerCase().includes('thanh toán') || message.body.toLowerCase().includes('debited')) {
        transactionType = 'expense';
    }

    let amount: number | null = null;
    if (amountMatch) {
        amount = parseFloat(amountMatch[2].replace(/\./g, '').replace(/,/g, '.'));
    }

    const accountNumber = accountMatch ? accountMatch[1] || accountMatch[2] : null;
    const description = descMatch ? descMatch[1].trim() : '';

    // Xử lý thời gian
    let time: string | null = null;
    if (timeMatch && timeMatch[1]) {
        // Đảm bảo định dạng HH:MM
        const timeParts = timeMatch[1].split(':');
        const hours = timeParts[0].padStart(2, '0');
        const minutes = timeParts[1].padStart(2, '0');
        time = `${hours}:${minutes}`;
    } else {
        // Mặc định lấy thời gian hiện tại
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        time = `${hours}:${minutes}`;
    }

    // Xử lý ngày tháng
    let formattedDate: string | null = null;
    if (dateMatch && dateMatch[1]) {
        const dateParts = dateMatch[1].split('/');
        const day = parseInt(dateParts[0], 10).toString().padStart(2, '0');
        const month = parseInt(dateParts[1], 10).toString().padStart(2, '0');

        // Xử lý năm - chuyển đổi từ 2 chữ số thành 4 chữ số nếu cần
        let year = dateParts[2];
        if (year.length === 2) {
            year = `20${year}`;
        }

        formattedDate = `${day}/${month}/${year}`;
    } else {
        const now = new Date();
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        formattedDate = `${day}/${month}/${year}`;
    }

    return {
        bankName,
        accountNumber,
        amount,
        type: transactionType,
        description,
        time, // Định dạng HH:MM
        date: formattedDate, // Định dạng DD/MM/YYYY
        read: true,
        originalMessage: message.body,
    };
};

export const readBankSMS = async (): Promise<ParsedSms[]> => {
    if (Platform.OS !== 'android') {
        console.log('⚠️ Thiết bị không phải Android!');
        return [];
    }

    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
            title: 'Quyền truy cập SMS',
            message: 'Ứng dụng cần quyền đọc SMS để lấy giao dịch ngân hàng.',
            buttonPositive: 'Đồng ý',
        }
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('❌ Không được cấp quyền đọc SMS');
        throw new Error('Chưa cấp quyền đọc SMS');
    }

    console.log('✅ Đã được cấp quyền SMS! Đang đọc tin nhắn...');

    const filter = {
        box: 'inbox',
        maxCount: 500,
    };

    return new Promise((resolve, reject) => {
        SmsAndroid.list(
            JSON.stringify(filter),
            (fail) => {
                console.log('❌ Lỗi đọc SMS:', fail);
                reject(new Error(fail));
            },
            (count, smsList) => {
                try {
                    const messages = JSON.parse(smsList) as SmsMessage[];
                    console.log(`📬 Tổng số SMS đọc được: ${messages.length}`);

                    const parsedMessages: ParsedSms[] = [];

                    for (const message of messages) {
                        const parsed = parseSMS(message);
                        if (parsed) {
                            parsedMessages.push(parsed);
                        }
                    }

                    console.log(`✅ Tổng số giao dịch ngân hàng tìm thấy: ${parsedMessages.length}`);
                    resolve(parsedMessages);
                } catch (error) {
                    console.error('❌ Lỗi xử lý SMS:', error);
                    reject(error);
                }
            }
        );
    });
};
