import parse from '../lib/parser';

describe('parser', () => {
	// UNIT TESTS
	it('type cmd', () => {
		let out = parse('git');
		expect(out).toEqual([​
			{type: 'cmd', val: 'git'}
		]);
	});
	it('type opt', () => {
		let out = parse('-f');
		expect(out).toEqual([​
			{type: 'opt', val: 'f'}
		]);
	});
	it('type string', () => {
		let out = parse(`'hello' "hi"`);
		expect(out).toEqual([​
			{type: 'string', val: 'hello'},
			{type: 'string', val: 'hi'}
		]);
	});
	it('type number', () => {
		let out = parse('123.4 123');
		expect(out).toEqual([​
			{type: 'number', val: 123.4},
			{type: 'number', val: 123}
		]);
	});

	it('all tokens', () => {
		let out = parse('git commit -m "message hi" --amend 123.4');
		expect(out).toEqual([​
			{type: 'cmd', val: 'git'},
			{type: 'cmd', val: 'commit'},
			{type: 'opt', val: 'm'},
			{type: 'string', val: 'message hi'},
			{type: 'opt', val: 'amend'},
			{type: 'number', val: 123.4}
		]);
	});
});