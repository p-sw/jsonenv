#!/usr/bin/env node

const spawn = require("cross-spawn");
const path = require("path");
const { parse, populate } = require("./index");

const argv = require("minimist")(process.argv.slice(2));

function printHelp() {
  console.log(
    [
      "Usage: dotenv [-h] [-d] [-i <path>] [-p <variable name>] [-- command]",
      "  -h   --help                print help",
      "  -d   --debug               only parse and print the result, don't run the `command` or putting values to environment",
      "  -i   --input <path>        parses the file <path> as a `.json` file and adds the variables to the environment",
      "                             multiple -e flags are allowed",
      "       --nested <separator>  parse nested structure and put separator between parent and child property names. default is `$`",
      "  -o   --override            override system variables.",
      "  command                    `command` is the actual command you want to run. Best practice is to precede this command with ` -- `. Everything after `--` is considered to be your command. So any flags will not be parsed by this tool but be passed to your command. If you do not do it, this tool will strip those flags",
    ].join("\n")
  );
}

/**
 * @typedef {Object} JsonEnvConfig
 * @property {boolean} help
 * @property {boolean} debug
 * @property {string[]} inputs
 * @property {string[]} prints
 * @property {string} nestSeparator
 * @property {boolean} override
 * @property {string} command
 * @property {string[]} cmdArgs
 */

/**
 * merge array without duplication
 * @param  {...(string | string[] | undefined)} args
 * @returns {string[]} merged array
 */
function uniqueSafeMerge(...args) {
  return args
    .filter((v) => !!v)
    .reduce(
      (p, c) => [
        ...p,
        ...(Array.isArray(c)
          ? c.filter((v) => !p.includes(v))
          : p.includes(c)
          ? []
          : [c]),
      ],
      []
    );
}

/**
 * Parse Argv
 *
 * @param {*} argv
 * @returns {JsonEnvConfig} parsed config object
 */
function parseArgv(argv) {
  return {
    help: !!(argv.help || argv.h),
    debug: !!(argv.debug || argv.d),
    inputs: uniqueSafeMerge(argv.i, argv.input),
    prints: uniqueSafeMerge(argv.p, argv.print),
    nestSeparator: argv.nested ?? "$",
    override: !!(argv.override || argv.o),
    command: argv._[0],
    cmdArgs: argv._.slice(1),
  };
}

const config = parseArgv(argv);
if (config.help) {
  printHelp();
  process.exit();
}

if (!config.command && !config.debug) {
  printHelp();
  process.exit(1);
}

if (config.debug) {
  config.inputs.forEach((v) => {
    Object.entries(parse(path.resolve(v), config.nestSeparator)).forEach(
      ([k, v]) => {
        console.log(`${k}=${v}`);
      }
    );
  });
  process.exit();
}

config.inputs.forEach((v) => {
  const parsed = parse(path.resolve(v), config.nestSeparator);
  populate(process.env, parsed, {
    debug: config.debug,
    override: config.override,
  });
});

spawn(config.command, config.cmdArgs, { stdio: "inherit" }).on(
  "exit",
  function (exitCode, signal) {
    if (typeof exitCode === "number") {
      process.exit(exitCode);
    } else {
      process.kill(process.pid, signal);
    }
  }
);
