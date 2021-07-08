import { parse } from '../dist/clui';

describe('clui', () => {
	describe('cli functions', () => {
		describe('command parser', () => {
			// MINI-UNIT TESTS
			it('should return type cmd', () => {
				let out = parse('git');
				expect(out).toEqual([​
					{type: 'cmd', val: 'git'}
				]);
			});
			it('should return type opt', () => {
				let out = parse('-f');
				expect(out).toEqual([​
					{type: 'opt', val: 'f'}
				]);
			});
			it('should return type string', () => {
				let out = parse(`'hello' "hi"`);
				expect(out).toEqual([​
					{type: 'string', val: 'hello'},
					{type: 'string', val: 'hi'}
				]);
			});
			it('should return type number', () => {
				let out = parse('123.4 123');
				expect(out).toEqual([​
					{type: 'number', val: 123.4},
					{type: 'number', val: 123}
				]);
			});
			
			// UNIT TESTS
			it('should return cmd, opt, and string tokens', () => {
				let out = parse('git commit -m "message hi" --amend');
				expect(out).toEqual([​
					{type: 'cmd', val: 'git'},
					{type: 'cmd', val: 'commit'},
					{type: 'opt', val: 'm'},
					{type: 'string', val: 'message hi'},
					{type: 'opt', val: 'amend'}
				]);
			});
		});
	});
});