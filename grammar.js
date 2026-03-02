/**
 * @file Adonix 4GL
 * @author Jacob Spreitzer
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "adonix4gl",

  conflicts: ($) => [
    [$.dims],
    [$.list, $.paren_expression],
    [$.instruction, $.expression],
    [$.source_file, $.expression],
    [$.keyword_funciton, $.array_identifier],
    [$.keyword_funciton, $.array_identifier, $.expression],
  ],

  supertypes: ($) => [$.expression, $.definition, $.literal, $.function],

  rules: {
    source_file: ($) =>
      repeat(
        seq(
          choice(
            $.comment,
            $.conditional,
            $.definition,
            $.flow,
            $.instruction,
            $.operation,
          ),
          optional(":"),
        ),
      ),

    definition: ($) =>
      choice(
        $.variable_definition,
        $.class_definition,
        $.parameter_definition,
        field("prog", $.prog_definition),
        field("label", $.label_definition),
      ),
    flow: ($) =>
      choice(
        seq("Goto", $.flow_identifier),
        seq("Call", $.flow_identifier),
        seq("Gosub", $.flow_identifier),
      ),
    conditional: ($) =>
      choice(
        seq(choice("If", "Elsif", "Case", "For"), $.expression),
        "Else",
        "Endif",
        "Endcase",
      ),
    instruction: ($) =>
      prec.right(seq($.identifier, repeat(seq($.expression, optional(","))))),
    operation: ($) => prec.right(1, seq($.expression, $.operand, $.expression)),
    unary_operation: ($) => seq(choice("!", "-"), $.expression),

    variable_definition: ($) =>
      prec.right(
        seq(
          $.scope,
          $.type,
          choice(
            seq($.identifier),
            seq($.identifier, $.dims),
            seq($.identifier, repeat1(seq(",", $.identifier))),
            seq($.identifier, $.dims, repeat1(seq(",", $.identifier, $.dims))),
          ),
        ),
      ),
    class_definition: ($) =>
      prec(1, seq($.scope, $.type, $.identifier, $.class)),
    parameter_definition: ($) =>
      prec.right(
        seq($.parameter_scope, $.type, $.identifier, prec(1, optional($.list))),
      ),
    prog_definition: ($) =>
      seq(
        field("type", choice("Subprog", "Funprog")),
        field("name", $.identifier),
        field("params", $.list),
      ),

    flow_identifier: ($) =>
      prec.right(
        seq(
          $.identifier,
          optional($.list),
          optional(seq("From", choice($.identifier, $.dynamic_identifier))),
        ),
      ),

    expression: ($) =>
      choice(
        $.operation,
        $.unary_operation,
        $.field,
        $.identifier,
        $.array_identifier,
        $.class,
        $.literal,
        $.range,
        $.function,
        $.paren_expression,
      ),
    paren_expression: ($) => seq("(", $.expression, ")"),
    list: ($) =>
      choice("()", seq("(", $.expression, repeat(seq(",", $.expression)), ")")),
    dims: ($) => repeat1(seq("(", $.expression, ")")),

    function: ($) => choice($.keyword_funciton, prec(1, $.funprog_funciton)),
    keyword_funciton: ($) => seq($.identifier, $.list),
    funprog_funciton: ($) =>
      seq(
        "func",
        optional(seq($.identifier, token.immediate("."))),
        $.identifier,
        $.list,
      ),

    literal: ($) =>
      choice($.squote_literal, $.dquote_literal, $.number_literal),
    squote_literal: ($) =>
      seq("'", repeat(token.immediate(prec(1, /[^']/))), "'"),
    dquote_literal: ($) =>
      seq('"', repeat(token.immediate(prec(1, /[^"]/))), '"'),

    number_literal: ($) => /([0-9]+\.[0-9]*)|[0-9]+|(\.[0-9]*)/,
    range: ($) => /([0-9]+)\.\.([0-9]*)/,
    scope: ($) => choice("Local", "Global"),
    parameter_scope: ($) => choice("Value", "Variable"),
    type: ($) =>
      choice(
        "Integer",
        "Decimal",
        "Date",
        "Char",
        "Clbfile",
        "Blbfile",
        "File",
        "Mask",
      ),
    field: ($) => prec.left(1, seq($.class, $.identifier, optional($.list))),
    identifier: ($) => /[_a-zA-Z]+[_a-zA-Z0-9]*\${0,1}/,
    array_identifier: ($) => prec.left(seq($.identifier, repeat1($.list))),
    label_definition: ($) => field("label", $.label_identifier),
    label_identifier: ($) => /\$[_a-zA-Z]+[_a-zA-Z0-9]*/,
    dynamic_identifier: ($) => /=[_a-zA-Z]+[_a-zA-Z0-9]*/,
    number: ($) => /\d+/,
    operand: ($) =>
      choice(
        "+",
        "-",
        "/",
        "*",
        "^",
        "=",
        "<>",
        "<",
        ">",
        "<=",
        ">=",
        "+=",
        "-=",
        "*=",
        "/=",
        "|",
        "or",
        "&",
        "and",
        "!",
        "not",
        "?",
        "xor",
        ";",
      ),
    comment: ($) => /#.+/,
    keyword: ($) => /[a-zA-Z$]+/,
    class: ($) => /\[.{1,8}\]/,
    brackets: ($) => choice("(", ")", "[", "]", "{", "}"),
    string_types: ($) => choice("'", '"'),
  },
});
