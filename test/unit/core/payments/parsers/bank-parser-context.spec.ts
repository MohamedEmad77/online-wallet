import { AcmeParser, FoodicsParser } from '@/core/payments/parsers';
import { BankParserContext } from '@/core/payments/parsers/bank-parser-context';

describe('ParserContext.getParser', () => {
  let context: BankParserContext;

  beforeEach(() => {
    context = new BankParserContext(new FoodicsParser(), new AcmeParser());
  });

  it('returns the FoodicsParser for key "foodics"', () => {
    const parser = context.getParser('foodics');
    expect(parser).toBeInstanceOf(FoodicsParser);
  });

  it('returns the AcmeParser for key "acme"', () => {
    const parser = context.getParser('acme');
    expect(parser).toBeInstanceOf(AcmeParser);
  });
});
