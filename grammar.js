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
    [$.keyword_funciton],
    [$.paren_expression, $.list],
    [$.instruction, $.expression],
    [$.source_file, $.expression],
    [$.identifier, $.expression],
  ],

  supertypes: ($) => [
    $.expression,
    $.definition,
    $.literal,
    $.function,
    $.identifier,
  ],

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
          optional(choice(":", "\n")),
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
      seq(field("call", $.flow_calls), field("identifier", $.flow_identifier)),
    conditional: ($) => choice(seq($.flow_ifs, $.expression), $.flow_instr),
    flow_calls: ($) => choice("Goto", "Call", "Gosub"),
    flow_ifs: ($) => choice("If", "Elsif", "Case", "For"),
    flow_instr: ($) => choice("Else", "Endif", "Endcase", "Return", "End"),
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
        field("type", $.prog_type),
        field("name", $.identifier),
        field("params", $.list),
      ),

    flow_identifier: ($) =>
      prec.right(
        seq(
          field("identifier", $.identifier),
          optional(field("params", $.list)),
          optional(
            seq(
              field("from", "From"),
              field(
                "from_identifier",
                choice($.identifier, $.dynamic_identifier),
              ),
            ),
          ),
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
      choice(
        "()",
        seq("(", $.expression, optional(repeat(seq(",", $.expression))), ")"),
      ),
    dims: ($) => repeat1($.paren_expression),

    function: ($) => choice($.keyword_funciton, prec(1, $.funprog_funciton)),
    keyword_funciton: ($) =>
      seq($.func_keyword, repeat(choice($.list, $.expression, $.func_keyword))),
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
    prog_type: ($) => choice("Subprog", "Funprog"),
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
    identifier: ($) => choice($.array_identifier, $.single_identifier),
    array_identifier: ($) =>
      prec.left(1, seq($.single_identifier, $.paren_expression)),
    single_identifier: ($) => /[_a-zA-Z]+[_a-zA-Z0-9]*\${0,1}/,
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
    func_keyword: ($) => choice("clalev", "string$"),
  },
});
