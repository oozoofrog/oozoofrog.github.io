---
title   : Swift 5.0
summary : Swift 5.0 내용 요약
date    : 2019-03-27 00:57:51 +0900
updated : 2019-03-28 11:26:28 +0900
tags    : 
toc     : true
public  : true
parent  : swift
parenttitle : Swift
latex   : false
---

> **읽기 안내 · 2026-10-28 보완:** Swift 5.0이 발표된 2019년의 릴리스 요약입니다. 아래 OS·Xcode·패키지 목록은 당시 기준이며 현재 설치 안내는 아닙니다. 누락된 Xcode 항목과 문서 링크를 보완했습니다.

*[원문](https://swift.org/blog/swift-5-released/)*

# Language Updates

## ABI 안정화 및 바이너리 호환성

### 새로운 피처

- Swift 라이브러리가 앞으로, macOS, iOS, tvOS, watchOS에 포함. 기존에는 앱에 포함되어 앱의 크기를 키웠음.
    - [ABI 안정화 그리고 그 이상](/blog/abi_stability_and_more/)
    - [Evolving Swift On Apple Platforms After ABI Stability](https://swift.org/blog/abi-stability-and-apple/)

<br/>
## Standard Library Updates

- String의 주된 내부 인코딩을 UTF-8로 바꾸어 많은 작업의 성능을 개선함(모든 작업이 빨라진다는 뜻은 아님)
    - [UTF-8 String](https://swift.org/blog/utf8-string/)
- raw text를 지원하는 string literal 추가
    - [String Literals](https://swift.org/blog/behind-se-0200/)
- Result 와 SIMD 벡터 타입 추가
- String interpolation 확장
- Dictionary 와 Set의 퍼포먼스 향상

### Swift Evolution

- [SE-0200 Enhancing String Literals Delimiters to Support Raw Text](https://github.com/apple/swift-evolution/blob/master/proposals/0200-raw-string-escaping.md)
- [SE-0211 Add Unicode Properties to Unicode.Scalar](https://github.com/apple/swift-evolution/blob/master/proposals/0211-unicode-scalar-properties.md)
- [SE-0214 Renaming the DictionaryLiteral type to KeyValuePairs](https://github.com/apple/swift-evolution/blob/master/proposals/0214-DictionaryLiteral.md)
- [SE-0215 Conform Never to Equatable and Hashable](https://github.com/apple/swift-evolution/blob/master/proposals/0215-conform-never-to-hashable-and-equatable.md)
- [SE-0218 Introduce compactMapValues to Dictionary](https://github.com/apple/swift-evolution/blob/master/proposals/0218-introduce-compact-map-values.md)
- [SE-0221 Character Properties](https://github.com/apple/swift-evolution/blob/master/proposals/0221-character-properties.md)
- [SE-0225 Adding isMultiple to BinaryInteger](https://github.com/apple/swift-evolution/blob/master/proposals/0225-binaryinteger-iseven-isodd-ismultiple.md)
- [SE-0228 Fix ExpressibleByStringInterpolation](https://github.com/apple/swift-evolution/blob/master/proposals/0228-fix-expressiblebystringinterpolation.md)
- [SE-0229 SIMD Vectors](https://github.com/apple/swift-evolution/blob/master/proposals/0229-simd.md)
- [SE-0232 Remove Some Customization Points from the Standard Library’s Collection Hierarchy](https://github.com/apple/swift-evolution/blob/master/proposals/0232-remove-customization-points.md)
- [SE-0233 Make Numeric Refine a new AdditiveArithmetic Protocol](https://github.com/apple/swift-evolution/blob/master/proposals/0233-additive-arithmetic-protocol.md)
- [SE-0234 Remove Sequence.SubSequence](https://github.com/apple/swift-evolution/blob/master/proposals/0234-remove-sequence-subsequence.md)
- [SE-0235 Add Result to the Standard Library](https://github.com/apple/swift-evolution/blob/master/proposals/0235-add-result.md)
- [SE-0237 Introduce withContiguous{Mutable}StorageIfAvailable methods](https://github.com/apple/swift-evolution/blob/master/proposals/0237-contiguous-collection.md)
- [SE-0239 Add Codable conformance to Range types](https://github.com/apple/swift-evolution/blob/master/proposals/0239-codable-range.md)
- [SE-0241 Deprecate String Index Encoded Offsets](https://github.com/apple/swift-evolution/blob/master/proposals/0241-string-index-explicit-encoding-offset.md)

<br/>
## 그 외, 언어사양 및 컴파일러 업데이트

- exclusive access to memory를 debug와 release 빌드에 기본 적용합니다.
    - [Swift 5 Exclusivity Enforcement](https://swift.org/blog/swift-5-exclusivity/)
- Python, JavaScript, Ruby와 같은 동적 타입 언어와의 상호 처리를 개선하기 위한 동적 callable 타입을 지원합니다.

- [SE-0192 Handling Future Enum Cases](https://github.com/apple/swift-evolution/blob/master/proposals/0192-non-exhaustive-enums.md)
- [SE-0213 Literal initialization via coercion](https://github.com/apple/swift-evolution/blob/master/proposals/0213-literal-init-via-coercion.md)
- [SE-0216 Introduce user-defined dynamically “callable” types](https://github.com/apple/swift-evolution/blob/master/proposals/0216-dynamic-callable.md)
- [SE-0224 Support ‘less than’ operator in compilation conditions](https://github.com/apple/swift-evolution/blob/master/proposals/0224-ifswift-lessthan-operator.md)
- [SE-0227 Identity key path](https://github.com/apple/swift-evolution/blob/master/proposals/0227-identity-keypath.md)
- [SE-0230 Flatten nested optionals resulting from ‘try?’](https://github.com/apple/swift-evolution/blob/master/proposals/0230-flatten-optional-try.md)

<br/>
## Package Manager

- Swift 5의 몇 가지 새로운 기능을 포함
    - 의존성 미러링
    - target 별 빌드 설정(좋다.)
    - 배포 target 사용자화
    - 코드 커버리지 데이터 생성
    - swift run 명령어를 통해 실행파일 빌드 없이 라이브러리를 REPL로 import할 수 있는 기능

### Swift Evolution

- [SE-0219 Package Manager Dependency Mirroring](https://github.com/apple/swift-evolution/blob/master/proposals/0219-package-manager-dependency-mirroring.md)
- [SE-0236 Package Manager Platform Deployment Settings](https://github.com/apple/swift-evolution/blob/master/proposals/0236-package-manager-platform-deployment-settings.md)
- [SE-0238 Package Manager Target Specific Build Settings](https://github.com/apple/swift-evolution/blob/master/proposals/0238-package-manager-build-settings.md)

<br/>
# Migrating to Swift 5

Swift 5는 Swift 4, 4.1, 4.2와 소스 호환됩니다. 

*Xcode 10.2에는 마이그레이터가 포함되어 있습니다. 자동 변환 결과를 읽어보고 의미가 달라지는 부분은 손으로 확인하는 편이 좋습니다.*

<br/>
# Documentation
[The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/) 문서가 업데이트 되었습니다. [Apple Books store](https://itunes.apple.com/us/book/the-swift-programming-language/id881256329?mt=11)에서도 무료로 받을 수 있습니다.


# Platforms

## Linux

공식 바이너리는 Ubuntu 18.04, Ubuntu 16.04, Ubuntu 14.04에서 사용 가능합니다.

<br/>
## Apple (Xcode)

Swift 5.0은 Xcode 10.2에 포함되었습니다. 위 원문에서 당시 배포 정보를 확인할 수 있습니다.

<br/>
# Sources

아래는 당시 Swift 5.0 개발에 사용된 저장소 목록입니다. 원문의 설명대로 최종 릴리스 기준은 `swift-5.0-RELEASE` 태그이며, 각 저장소의 현재 기본 브랜치가 Swift 5.0이라는 뜻은 아닙니다.

- [swift](https://github.com/apple/swift)
- [swift-clang](https://github.com/apple/swift-clang)
- [swift-clang-tools-extra](https://github.com/apple/swift-clang-tools-extra)
- [swift-cmark](https://github.com/apple/swift-cmark)
- [swift-corelibs-foundation](https://github.com/apple/swift-corelibs-foundation)
- [swift-corelibs-libdispatch](https://github.com/apple/swift-corelibs-libdispatch)
- [swift-corelibs-xctest](https://github.com/apple/swift-corelibs-xctest)
- [swift-libcxx](https://github.com/apple/swift-libcxx)
- [swift-llbuild](https://github.com/apple/swift-llbuild)
- [swift-lldb](https://github.com/apple/swift-lldb)
- [swift-llvm](https://github.com/apple/swift-llvm)
- [swift-package-manager](https://github.com/apple/swift-package-manager)
- [swift-stress-tester](https://github.com/apple/swift-stress-tester)
- [swift-syntax](https://github.com/apple/swift-syntax)
- [swift-xcode-playground-support](https://github.com/apple/swift-xcode-playground-support)
- [swift-compiler-rt](https://github.com/apple/swift-compiler-rt)
- [swift-integration-tests](https://github.com/apple/swift-integration-tests)
