# Documentation
[PLACEHOLDER]

## Commands

Commands are the backbone of the CLUI. Without them, nothing would work and there would be no practical use for it. Because we don’t live in that alternate reality, you have the pleasure of learning about them!

### Defining a command

All commands for the CLUI are objects. The command object is structured like so:

```ts
interface Command {
	desc?: string,
	commands?: Record<string, Command>,
	mode?: 'form' | 'toast',
	run?: (gui: typeof clui.Page | typeof clui.Toast, args: Arg[]) => void,
	args?: Arg[]
}
```

- The `commands` property is an object which contains any sub commands

- The `mode` property describes the display mode of the command

- The `run` function is the main part of the command that runs whenever the command is triggered



The arguments for a command, located in the `args` property, ate structured like so:

```ts
interface Arg {
	name: string,
	desc?: string,
	type: 'string' | 'boolean' | 'number' | 'enum' | 'button' | 'paragraph' | 'table',
	value?: any,
	short?: string,
	required?: boolean,
	items?: Arg[],
	run?: () => void
}
```

As you can see, an argument can have a plethora of properties. It’s not a difficult as it looks:

- The `type` property defines the argument type (used for form generation and type-checking)
  - The `button`, `paragraph`, and `table` types are only for Page rendering and will not be checked in the CLI or displayed in the dropdown
- The `value` property defines the default value of an argument

- The `short` property contains the single-character shortname of a command (eg: `name: force` => `short: f`)

- The `items` property is for the `enum` type which can contain an array of Arg-like items that a user can select from

- The `run` function is for the `button` type which will run the function when clicked

### Loading commands

There are two ways of setting up commands in the CLUI:

1. In the backend, the `commands.ts` file contains any default or “pre-built” commands a developer would like to ship
2. In the frontend, using `clui.load(Record<string, Command>)` or `clui.add(Command)` methods to add commands along with the pre-built”

Both of these methods use the exact same structure as explained [above](#defining-a-command) except that the 1st option uses an exported object while the 2nd uses a function with the object as a parameter

### Methods & Properties

[PLACEHOLDER]