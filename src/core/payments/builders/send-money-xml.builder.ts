import { SendMoneyDto } from '../dtos/send-money.dto';

export class SendMoneyXmlBuilder {
  constructor(private readonly sendMoneyDto: SendMoneyDto) {}

  build(): string {
    const {
      reference,
      date,
      amount,
      currency,
      senderAccount,
      receiverBankCode,
      receiverAccount,
      receiverName,
      notes = [],
      paymentType = 99,
      chargeDetails = 'SHA',
    } = this.sendMoneyDto;

    const esc = this.escape;

    let xml = `<?xml version="1.0" encoding="utf-8"?>\n<PaymentRequestMessage>\n`;

    xml += ` <TransferInfo>\n`;
    xml += `  <Reference>${esc(reference)}</Reference>\n`;
    xml += `  <Date>${esc(date)}</Date>\n`;
    xml += `  <Amount>${amount.toFixed(2)}</Amount>\n`;
    xml += `  <Currency>${esc(currency)}</Currency>\n`;
    xml += ` </TransferInfo>\n\n`;

    xml += ` <SenderInfo>\n`;
    xml += `  <AccountNumber>${esc(senderAccount)}</AccountNumber>\n`;
    xml += ` </SenderInfo>\n\n`;

    xml += ` <ReceiverInfo>\n`;
    xml += `  <BankCode>${esc(receiverBankCode)}</BankCode>\n`;
    xml += `  <AccountNumber>${esc(receiverAccount)}</AccountNumber>\n`;
    xml += `  <BeneficiaryName>${esc(receiverName)}</BeneficiaryName>\n`;
    xml += ` </ReceiverInfo>\n\n`;

    if (notes.length) {
      xml += ` <Notes>\n`;
      for (const note of notes) {
        xml += `  <Note>${esc(note)}</Note>\n`;
      }
      xml += ` </Notes>\n\n`;
    }

    if (paymentType !== 99) {
      xml += ` <PaymentType>${paymentType}</PaymentType>\n\n`;
    }
    if (chargeDetails !== 'SHA') {
      xml += ` <ChargeDetails>${esc(chargeDetails)}</ChargeDetails>\n\n`;
    }

    xml += `</PaymentRequestMessage>`;
    return xml;
  }

  private escape(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
