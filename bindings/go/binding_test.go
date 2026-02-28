package tree_sitter_adonix4gl_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_adonix4gl "github.com/tree-sitter/tree-sitter-adonix4gl/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_adonix4gl.Language())
	if language == nil {
		t.Errorf("Error loading Adonix 4GL grammar")
	}
}
