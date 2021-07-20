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

	describe('cursor output', () => {
		it('cursor.start', () => {
			let out = parse('git commit -m "message hi" --amend 123.4', {start: 0});
			expect(out).toEqual([​
				{type: 'cmd', val: 'git', cursor: true},
				{type: 'cmd', val: 'commit', cursor: false},
				{type: 'opt', val: 'm', cursor: false},
				{type: 'string', val: 'message hi', cursor: false},
				{type: 'opt', val: 'amend', cursor: false},
				{type: 'number', val: 123.4, cursor: false}
			]);
		});
		it('cursor.start = 0 and cursor.end', () => {
			let out = parse('git commit -m "message hi" --amend 123.4', {start: 0, end: 6});
			expect(out).toEqual([​
				{type: 'cmd', val: 'git', cursor: true},
				{type: 'cmd', val: 'commit', cursor: true},
				{type: 'opt', val: 'm', cursor: false},
				{type: 'string', val: 'message hi', cursor: false},
				{type: 'opt', val: 'amend', cursor: false},
				{type: 'number', val: 123.4, cursor: false}
			]);
		});
		it('cursor.start and cursor.end', () => {
			let out = parse('git commit -m "message hi" --amend 123.4', {start: 2, end: 6});
			expect(out).toEqual([​
				{type: 'cmd', val: 'git', cursor: true},
				{type: 'cmd', val: 'commit', cursor: true},
				{type: 'opt', val: 'm', cursor: false},
				{type: 'string', val: 'message hi', cursor: false},
				{type: 'opt', val: 'amend', cursor: false},
				{type: 'number', val: 123.4, cursor: false}
			]);
		});
	});
});