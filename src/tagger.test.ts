import { formatPrefix } from './tagger';

describe('tagger', () => {
    test('formatPrefix with no prefix', () => {
        expect(formatPrefix('')).toBe('');
    });

    test('formatPrefix with prefix', () => {
        expect(formatPrefix('abc')).toBe('abc-');
    });

    test('formatPrefix with prefix that has spaces', () => {
        expect(formatPrefix('to be or not to be')).toBe('to-be-or-not-to-be-');
    });
});
