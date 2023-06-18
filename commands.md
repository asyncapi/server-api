# Commands


* [`command1`](#command1)
* [`command1 subcommand1`](#command1-subcommand1)
* [`command1 subcommand2`](#command1-subcommand2)
* [`command2`](#command2)
* [`command2 subcommand1`](#command2-subcommand1)
* [`command2 subcommand2`](#command2-subcommand2)
* [`generate`](#generate)
* [`generate models`](#generate-models)

## `command1`

data for command1

```
more data for command1.

```


## `command1 subcommand1`

data for command1 subcommand1

```
more data for command1 subcommand 1
```


## `command1 subcommand2`

data for command1 subcommand2

```
more data for command1 subcommand 2

```


## `command2`

data for command2

```
more data for command2.

```


## `command2 subcommand1`

data for command2 subcommand1

```
USAGE
  $ asyncapi config context add CONTEXT-NAME SPEC-FILE-PATH [-h]

ARGUMENTS
  CONTEXT-NAME    context name
  SPEC-FILE-PATH  file path of the spec file

FLAGS
  -h, --help  Show CLI help.

DESCRIPTION
  Add or modify a context in the store
```


## `command2 subcommand2`

data for command2 subcommand2

```
more data for command2 subcommand 2

```



## `generate`

Generate typed models or other things like clients, applications or docs using AsyncAPI Generator templates.

```
USAGE
  $ asyncapi generate

DESCRIPTION
  Generate typed models or other things like clients, applications or docs using AsyncAPI Generator templates.
```

_See code: [src/commands/generate/index.ts](https://github.com/asyncapi/cli/blob/v0.48.0/src/commands/generate/index.ts)_


## `generate models`

Generates typed models

```
USAGE
  $ asyncapi generate models LANGUAGE FILE [-h] [-o <value>] [--tsModelType class|interface] [--tsEnumType
    enum|union] [--tsModuleSystem ESM|CJS] [--tsIncludeComments] [--tsExportType default|named] [--tsJsonBinPack]
    [--packageName <value>] [--namespace <value>] [--csharpAutoImplement] [--csharpNewtonsoft] [--csharpArrayType
    Array|List] [--csharpHashcode] [--csharpEqual] [--csharpSystemJson] [--log-diagnostics] [--diagnostics-format
    json|stylish|junit|html|text|teamcity|pretty] [--fail-severity error|warn|info|hint]

ARGUMENTS
  LANGUAGE  (typescript|csharp|golang|java|javascript|dart|python|rust|kotlin|php|cplusplus) The language you want the
            typed models generated for.
  FILE      Path or URL to the AsyncAPI document, or context-name

FLAGS
  -h, --help                                                           Show CLI help.
  -o, --output=<value>                                                 The output directory where the models should be
                                                                       written to. Omitting this flag will write the
                                                                       models to `stdout`.
  --csharpArrayType=<option>                                           [default: Array] C# specific, define which type
                                                                       of array needs to be generated.
                                                                       <options: Array|List>
  --csharpAutoImplement                                                C# specific, define whether to generate
                                                                       auto-implemented properties or not.
  --csharpEqual                                                        C# specific, generate the models with the Equal
                                                                       method overwritten
  --csharpHashcode                                                     C# specific, generate the models with the
                                                                       GetHashCode method overwritten
  --csharpNewtonsoft                                                   C# specific, generate the models with newtonsoft
                                                                       serialization support
  --csharpSystemJson                                                   C# specific, generate the models with
                                                                       System.Text.Json serialization support
  --diagnostics-format=(json|stylish|junit|html|text|teamcity|pretty)  [default: stylish] format to use for validation
                                                                       diagnostics
  --fail-severity=(error|warn|info|hint)                               [default: error] diagnostics of this level or
                                                                       above will trigger a failure exit code
  --[no-]log-diagnostics                                               log validation diagnostics or not
  --namespace=<value>                                                  C#, C++ and PHP specific, define the namespace to
                                                                       use for the generated models. This is required
                                                                       when language is `csharp`,`c++` or `php`.
  --packageName=<value>                                                Go, Java and Kotlin specific, define the package
                                                                       to use for the generated models. This is required
                                                                       when language is `go`, `java` or `kotlin`.
  --tsEnumType=<option>                                                [default: enum] TypeScript specific, define which
                                                                       type of enums needs to be generated.
                                                                       <options: enum|union>
  --tsExportType=<option>                                              [default: default] TypeScript specific, define
                                                                       which type of export needs to be generated.
                                                                       <options: default|named>
  --tsIncludeComments                                                  TypeScript specific, if enabled add comments
                                                                       while generating models.
  --tsJsonBinPack                                                      TypeScript specific, define basic support for
                                                                       serializing to and from binary with jsonbinpack.
  --tsModelType=<option>                                               [default: class] TypeScript specific, define
                                                                       which type of model needs to be generated.
                                                                       <options: class|interface>
  --tsModuleSystem=<option>                                            [default: ESM] TypeScript specific, define the
                                                                       module system to be used.
                                                                       <options: ESM|CJS>

DESCRIPTION
  Generates typed models
```

