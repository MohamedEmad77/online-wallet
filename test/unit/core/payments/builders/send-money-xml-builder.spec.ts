import { SendMoneyXmlBuilder } from '@/core/payments/builders';
import { SendMoneyDto } from '@/core/payments/dtos';

describe('SendMoneyXmlBuilder', () => {
  const sendMoneyDto: SendMoneyDto = {
    reference: 'ref-123',
    date: '2025-02-25 06:33:00+03',
    amount: 177.39,
    currency: 'SAR',
    senderAccount: 'SA6980000204608016212908',
    receiverBankCode: 'FDCSSARI',
    receiverAccount: 'SA6980000204608016211111',
    receiverName: 'Jane Doe',
  };

  it('omits optional sections when defaults are used', () => {
    const dto = { ...sendMoneyDto };
    const xml = new SendMoneyXmlBuilder(dto).build();

    expect(xml).toContain('<TransferInfo>');
    expect(xml).not.toContain('<Notes>');
    expect(xml).not.toContain('<PaymentType>');
    expect(xml).not.toContain('<ChargeDetails>');
  });

  it('includes Notes, PaymentType, and ChargeDetails when provided', () => {
    const dto: SendMoneyDto = {
      ...sendMoneyDto,
      notes: ['NoteOne', 'NoteTwo'],
      paymentType: 421,
      chargeDetails: 'RB',
    };
    const xml = new SendMoneyXmlBuilder(dto).build();

    expect(xml).toContain('<Notes>');
    expect(xml).toContain('  <Note>NoteOne</Note>');
    expect(xml).toContain('  <Note>NoteTwo</Note>');
    expect(xml).toContain('<PaymentType>421</PaymentType>');
    expect(xml).toContain('<ChargeDetails>RB</ChargeDetails>');
  });

  it('properly escapes XML special characters', () => {
    const dto: SendMoneyDto = {
      ...sendMoneyDto,
      reference: 'ref&<>"\'123',
      currency: 'S&A<R',
      senderAccount: 'ACC&1',
      receiverBankCode: 'B<CODE',
      receiverAccount: 'ACC>2',
      receiverName: 'Name"Test\'',
      notes: ['A&B', '<note>'],
      paymentType: 99,
      chargeDetails: 'SHA',
    };
    const xml = new SendMoneyXmlBuilder(dto).build();

    expect(xml).toContain(
      '<Reference>ref&amp;&lt;&gt;&quot;&apos;123</Reference>',
    );
    expect(xml).toContain('<Currency>S&amp;A&lt;R</Currency>');
    expect(xml).toContain('<AccountNumber>ACC&amp;1</AccountNumber>');
    expect(xml).toContain('<BankCode>B&lt;CODE</BankCode>');
    expect(xml).toContain('<Note>A&amp;B</Note>');
    expect(xml).toContain('<Note>&lt;note&gt;</Note>');
  });
});
