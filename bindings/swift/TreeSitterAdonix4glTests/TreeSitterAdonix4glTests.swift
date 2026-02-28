import XCTest
import SwiftTreeSitter
import TreeSitterAdonix4gl

final class TreeSitterAdonix4glTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_adonix4gl())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Adonix 4GL grammar")
    }
}
