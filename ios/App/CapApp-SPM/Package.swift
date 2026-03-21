// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.2.0"),
        .package(name: "CapacitorCamera", path: "../../../node_modules/.pnpm/@capacitor+camera@8.0.2_@capacitor+core@8.2.0/node_modules/@capacitor/camera"),
        .package(name: "CapgoCameraPreview", path: "../../../node_modules/.pnpm/@capgo+camera-preview@8.1.4_patch_hash=a9e9b3d852e7698cae22865faf4b5bc80b7b2bd42a9647ca_333da2d29ef490b772a7d5d3a01eec1e/node_modules/@capgo/camera-preview")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorCamera", package: "CapacitorCamera"),
                .product(name: "CapgoCameraPreview", package: "CapgoCameraPreview")
            ]
        )
    ]
)