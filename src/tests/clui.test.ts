import CLUI from '../clui';

let clui: CLUI;

beforeEach(() => {
	clui = new CLUI();
});

describe('clui', () => {
	// UNIT TESTS
	describe('load', () => {
		it('load one command', () => {
			clui.load({name: 'git'});
			expect(clui.commands.get('git')).toEqual({name: 'git'});
		});
		it('load multiple commands', () => {
			const commands = [{name: 'git'}, {name: 'npm'}, {name: 'bower'}];
			clui.load(...commands);
			
			commands.forEach(command => {
				expect(clui.commands.get(command.name)).toEqual(command);
			});
		});
		it.skip('load command via URL', () => { // TODO: Figure out how to export commands via file
			clui.loadURL('../test/test_commands.js');
			expect(clui.commands.get('git')).toEqual({name: 'git'});
		});
	});
});