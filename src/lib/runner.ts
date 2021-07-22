import type * as types from '../clui.types';
import { Command, Arg } from '../clui';
import type { matcher } from './matcher';

export default function(tokens: matcher) {
	for (let i = 0; i < tokens.length; i++) {
		let token = tokens[i];
		if (token instanceof Command) { // if token is a command
			let commands = tokens.filter(el => el instanceof Command);
      const command = commands[commands.length - 1];
      let args = tokens.filter(el => el instanceof Arg);

      if (command) {
        let allRequired = true;
        if (command.type === 'arg') {
          let required = command.children.filter((el: Arg) => el.required).length;
          allRequired = required === args.filter(el => el.required).length;
        }

        return new Promise<{success: boolean, output: any}>((resolve, reject) => {
					if (!allRequired) resolve({success: false, output: 'Error: Missing required arguments'});

          const ctx: types.RunCtx = {
            command,
            done: (success, ...output) => {
              resolve({success, output});
            }
          };

          if (command.run) command.run(ctx, args);
          else resolve({success: false, output: 'Error: Command has no run function'});
        });
      } else {
				// TODO: reject
			}
		}
	}
};