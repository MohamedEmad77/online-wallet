export const xmlMock = `<?xml version="1.0" encoding="utf-8"?>
<PaymentRequestMessage>
 <TransferInfo>
  <Reference>REF123</Reference>
  <Date>2025-05-15 10:00:00+00</Date>
  <Amount>42.50</Amount>
  <Currency>USD</Currency>
 </TransferInfo>

 <SenderInfo>
  <AccountNumber>SA1</AccountNumber>
 </SenderInfo>

 <ReceiverInfo>
  <BankCode>BK1</BankCode>
  <AccountNumber>RA2</AccountNumber>
  <BeneficiaryName>Alice</BeneficiaryName>
 </ReceiverInfo>

 <Notes>
  <Note>n1</Note>
  <Note>n2</Note>
 </Notes>

 <PaymentType>200</PaymentType>

 <ChargeDetails>RB</ChargeDetails>

</PaymentRequestMessage>`;
