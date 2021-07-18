import CLUI from '../clui';

let clui: CLUI;

beforeEach(() => {
	clui = new CLUI(); // reset the CLUI instance
});

describe('clui', () => {
	describe('load', () => {
		it('load one command', () => {
			clui.load({name: 'git'});
			expect(clui.commands.find(el => el.name === 'git')).toEqual({name: 'git'});
		});
		it('load multiple commands', () => {
			const commands = [{name: 'git'}, {name: 'npm'}, {name: 'bower'}];
			clui.load(...commands);
			
			commands.forEach(command => {
				expect(clui.commands.find(el => el.name === command.name)).toEqual(command);
			});
			expect(clui.commands).toEqual(commands);
		});
		it.skip('load commands via URL', () => { // TODO: Figure out how to export commands via file
			clui.loadURL('../test_commands.js');
			expect(clui.commands.find(el => el.name === 'git')).toEqual({name: 'git'});
		});
	});

	describe('match', () => {
		it('match last command in tokens', () => {
			const commands = [{name: 'git'}, {name: 'npm'}, {name: 'bower'}];
			clui.load(...commands);

			commands.forEach(command => {
				expect(clui.match(clui, clui.parse(command.name))).toEqual(command);
			});
		});
		it.skip('match all commands in tokens', () => {
			const commands = [{name: 'git'}, {name: 'npm'}, {name: 'bower'}];
			clui.load(...commands);

			commands.forEach(command => {
				expect(clui.match(clui, clui.parse(command.name))).toEqual(command);
			});
		});
	});
});