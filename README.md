# JSONEnv

Load environment variables from JSON files

## Install

```
$ yarn add -D jsonenv
```

### Usage

```
Usage: dotenv [-h] [-d] [-i <path>] [-p <variable name>] [-- command]
  -h   --help                print help
  -d   --debug               only parse and print the result, don't run the `command` or putting values to environment
  -i   --input <path>        parses the file <path> as a `.json` file and adds the variables to the environment
                             multiple -e flags are allowed
       --nested <separator>  parse nested structure and put separator between parent and child property names. default is `$`
  -o   --override            override system variables.
  command                    `command` is the actual command you want to run. Best practice is to precede this command with ` -- `. Everything after `--` is considered to be your command. So any flags will not be parsed by this tool but be passed to your command. If you do not do it, this tool will strip those flags
```
