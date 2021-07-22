import { Command, Arg } from "../clui";

const convert = (cmd: Command) => {
  cmd = new Command(cmd, false);

  if (cmd.children && cmd.type === 'cmd') {
    let list = [];
    for (let item of cmd.children) {
      list.push(convert(item as Command));
    }
    cmd.children = list;
  } else if (cmd.children && cmd.type === 'arg') {
    let list = [];
    for (let item of cmd.children) {
      list.push(new Arg(item as Arg));
    }
    cmd.children = list;
  }

  return cmd;
};

export default convert;