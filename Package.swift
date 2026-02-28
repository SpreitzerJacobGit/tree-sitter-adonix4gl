// swift-tools-version:5.3

import Foundation
import PackageDescription

var sources = ["src/parser.c"]
if FileManager.default.fileExists(atPath: "src/scanner.c") {
    sources.append("src/scanner.c")
}

let package = Package(
    name: "TreeSitterAdonix4gl",
    products: [
        .library(name: "TreeSitterAdonix4gl", targets: ["TreeSitterAdonix4gl"]),
    ],
    dependencies: [
        .package(name: "SwiftTreeSitter", url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.9.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterAdonix4gl",
            dependencies: [],
            path: ".",
            sources: sources,
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterAdonix4glTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterAdonix4gl",
            ],
            path: "bindings/swift/TreeSitterAdonix4glTests"
        )
    ],
    cLanguageStandard: .c11
)
