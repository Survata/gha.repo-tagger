import { create } from './tag';

describe('creating tag', () => {
    beforeEach(() => {
        // mock Date.now() to return GMT: Saturday, January 9, 2021 4:18:51 PM
        // const realDateNow = Date.now.bind(global.Date);
        const dateNowStub = jest.fn(() => 1610209131000);
        global.Date.now = dateNowStub;
    });

    test('prior tag is before today', () => {
        expect(create('2021.0108.01', '')).toBe('2021.0109.01');
    });

    test('prior tag is today', () => {
        expect(create('2021.0109.01', '')).toBe('2021.0109.02');
    });

    test('prior tag is after today', () => {
        expect(create('2021.0110.01', '')).toBe('2021.0110.02');
    });

    test('prior tag is before today and has prefix', () => {
        expect(create('abc-2021.0108.01', 'abc-')).toBe('abc-2021.0109.01');
    });

    test('prior tag is today and has prefix', () => {
        expect(create('abc-2021.0109.01', 'abc-')).toBe('abc-2021.0109.02');
    });

    test('prior tag is after today and has prefix', () => {
        expect(create('abc-2021.0110.01', 'abc-')).toBe('abc-2021.0110.02');
    });

    test('prior tag is before today and prefix differs', () => {
        expect(create('abc-2021.0108.01', 'xyz-')).toBe('xyz-2021.0109.01');
    });

    test('prior tag is today and prefix differs', () => {
        expect(create('abc-2021.0109.01', 'xyz-')).toBe('xyz-2021.0109.01');
    });

    test('prior tag is after today and prefix differs', () => {
        expect(create('abc-2021.0110.01', 'xyz-')).toBe('xyz-2021.0109.01');
    });
});
