# CLUI

This project is based on the CLUI [created by repl.it](https://blog.repl.it/clui) but has many more features and integrations.

# Quickstart

## Installation

First, add the library
```html
<script src="clui.min.js" type="text/javascript">
```

Next, create a div in which to display the CLUI
```html
<div id="clui">
```

Lastly, start the system by calling the method below
```js
clui.setup({/* ...options */})
// or omit options
clui.setup()
```

## Importing Commands

The CLUI does not come preloaded with any commands. This is because every implementation is different. Every developer will have to create their own commands for their own purpose. If you would like to test out the CLUI or use a command pack, see the instructions below. If you want to create your own commands, see the [commands](#commands) section.

To import a command pack, just run the `.load()` method with the path to the command file. The `.load()` method takes in either a valid URL/path or a valid [commands object](). Here are a few examples of the method:

```js
// local path (you prepend '/' before the path if needed)
clui.load('commands.js')

// external path
clui.load('https://example.site/commands.js')

// variable (must be a valid command object)
clui.load(commands)
```

**Note:** When importing commands which have the same name, the original will be replaced by the latter. To prevent this from happening, you can set the `keep` option in the second parameter of the `.load()` method.

# Library

## clui

The root methods for setup and control.

### clui.load(path[, options])

**Description:** Loads the commands specified in the `path` or `object`.

**Params:**

- `path`
  - `string:path` - the path at which to load the commands
  - `object:path` - the commands object to load
- `options`
  - `boolean:keep` - keeps existing commands and prevents the new commands from overwriting them

**Returns:**

- `object` - the commands object with the newly loaded commands included
- `boolean:false` - if the system failed to load the new commands via `path`

## clui.system

The method at which to modify and control the command parser and interface.

### system.add(name)

**Description:** Adds a command via the `name` provided. Name can either be a string or an object, depending if command name or the command itself is setup.

**Params:**

- `string:name` - the name of the command to add

**Returns:**

- `boolean:true` - if the targeted command is found and was successfully added to the stack
- `boolean:false` - if `name` is empty or undefined
- `array` - if the targeted command was not found but has matching commands, it will return an array of the matching command names

### system.back()

**Description:** Works like a “pop” function which removes the last command from the command array. If there is no command present, the function will return false.

**Returns:**

- `boolean:false` - if the system cannot go back
- `array` - if the system successfully went back, it will return the popped command

### system.isRoot()

**Description:** Checks if the system is on the [root state]() or on a command.

**Returns:**

- `boolean:true` - if the system is on the [root state]()
- `boolean:false` - if the system is on a command

### system.render(args)

**Description:** Renders a form or page (given `args`) for the current command

**Params:**

**Returns:**

### system.find(name, asRaw)

**Description:**

**Params:**

**Returns:**