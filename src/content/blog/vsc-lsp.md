---
title   : Visual Studio Code에서 스위프트 LSP 사용하기
summary : 
date    : 2019-02-17 21:13:21 +0900
updated : 2019-02-17 22:58:01 +0900
tags    : 
toc     : true
public  : true
parent  : swift
parenttitle : swift
latex   : false
---

> **2026-10-28 검토:** 2019-02-14 개발 스냅샷을 사용하던 설치 기록입니다. 당시 sourcekit-lsp 소스의 커밋과 확장 버전이 남아 있지 않아 현재 그대로 재현할 수 있는 절차는 아닙니다.


# 시작
1. https://swift.org/download/#snapshots 에서 [swift-DEVELOPMENT_SNAPSHOT-2019-02-14-a](https://swift.org/builds/development/xcode/swift-DEVELOPMENT-SNAPSHOT-2019-02-14-a/swift-DEVELOPMENT-SNAPSHOT-2019-02-14-a-osx.pkg)를 다운로드하고 설치합니다.
2. 당시 사용한 [sourcekit-lsp 저장소](https://github.com/swiftlang/sourcekit-lsp)를 체크아웃한 디렉터리에서 `swift build`로 바이너리를 빌드했습니다. 위 툴체인을 선택하고 저장소 루트에 있어야 하는 단계입니다. 현재 main을 옛 툴체인으로 빌드하라는 뜻은 아닙니다.
    - 당시 macOS에서는 아래와 같이 Xcode 프로젝트를 생성해 빌드하는 방법도 적어두었습니다.
    - `swift package generate-xcodeproj --xcconfig-overrides overrides.xcconfig`는 당시 SwiftPM과 저장소의 `overrides.xcconfig`를 전제로 한 명령입니다. 현재 SwiftPM용 명령으로 안내하는 것은 아닙니다.
3. VS Code에서 sourcekit-lsp를 사용할 수 있도록 설정합니다.
    - Preference/Extensions/sourcekit-lsp 에서 sourcekit-lsp 바이너리가 위치하는 경로와 swift toolchain 경로를 설정하게 되어있는데 맘편하게 실제 경로를 모두 넣어줍시다.

## 지금 시작한다면

옛 스냅샷을 설치하기보다 [Swift 공식 VS Code 설정 안내](https://www.swift.org/documentation/articles/getting-started-with-vscode-swift.html)를 따라 Swift 툴체인과 Swift 확장을 설치한다. 먼저 `swift --version`으로 선택된 툴체인을 확인하고, `Package.swift`가 있는 프로젝트를 열어 빌드와 코드 탐색을 확인하자. Xcode 프로젝트 지원과 Swift 패키지 지원을 같은 것으로 가정하지 않도록 확장의 지원 프로젝트 범위도 확인한다.
