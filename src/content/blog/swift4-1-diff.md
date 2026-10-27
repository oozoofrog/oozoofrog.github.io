---
title: 스위프트 4.1 변경사항 요약
date    : 2018-04-09 00:00:00 +0900
parent: swift
---

> **검토 메모 · 2026-10-28:** Swift 4.1(2018년) 변경사항을 정리한 글입니다. 인덱스의 Hashable 채택, compactMap의 적용 범위, 소유권 키워드의 경고/오류 시점을 Swift Evolution 제안서에 맞춰 정정했습니다. 예제는 Swift 4.1 문법 기준이며 이번 검토에서 당시 컴파일러로 실행하지는 않았습니다.

from [raywenderlich](https://www.raywenderlich.com/187826/whats-new-in-swift-4-1)

<br/>
# 언어 개선

## Conditional Conformance
evolution: [SE-0143](https://github.com/apple/swift-evolution/blob/master/proposals/0143-conditional-conformances.md)

### in standard library

- Optional의 Wrapped가 Equatable을 상속받은 타입이라면 Optional도 Equatable이 되었다.
- 이 말인 즉슨 `[Int?] == [Int?]` 비교가 가능해졌다는 이야기
- `[ [Int] ] == [ [Int] ]`도 가능하다.
- Array, Dictionary의 Value가 Equatable이면 Array, Dictionary도 Equatable이다.

### in code

~~~swift

protocol Valuable {}

struct Property<Value> {
	var property: String
	var value: Value
}

struct TestValue: Valuable {}
extension Int: Valuable {}

extension Property: Equatable where Value: Equatable {
	static func == (lhs: Property<Value>, rhs: Property<Value>) -> Bool {
		return lhs.property == rhs.property && lhs.value == rhs.value
	}
}

let t1 = Property(property: "t1", value: 1)
let t2 = Property(property: "t2", value: 1)

print(t1 == t2)
~~~
- Swift 4.1부터 타입 매개변수가 조건을 만족할 때만 프로토콜을 채택하는 조건부 준수(conditional conformance)를 선언할 수 있다. `where` 자체가 처음 도입된 것은 아니다.

<br/>
### in JSON parsing

- Codable을 이용하는 경우에도 Optional, Array, Dictionary에서도 잘 작동합니다.

<br/>
## JSON Encoding시에 카멜 케이스와 스네이크 케이스를 변환할 수 있다.

- 인코딩시 키 문자열을 snake case로 변환하는 옵션이 추가되었다.
- 디코딩시 키 문자열을 snake case에서 camel case로 변환하는 옵션이 추가되었다.

<br/>
## Equatable, Hashable 프로토콜이 편해졌다.

evolution: [SE-0185](https://github.com/apple/swift-evolution/blob/master/proposals/0185-synthesize-equatable-hashable.md)

- boilerplate code 제거
- 조건을 만족하는 구조체·열거형은 명시적으로 `==` 함수나 `hashValue` 프로퍼티를 작성하지 않아도 된다. 저장 프로퍼티 또는 연관 값도 해당 프로토콜을 준수해야 하며, 타입 자체의 `Equatable`/`Hashable` 채택 선언은 필요하다.

<br/>
## Hashable Index Types

evolution: [SE-0188](https://github.com/apple/swift-evolution/blob/master/proposals/0188-stdlib-index-types-hashable.md)

- `String.Index`, `Dictionary.Index`, `Set.Index` 등 표준 라이브러리의 인덱스 타입에 `Hashable` 준수가 추가되었다. 배열의 인덱스인 `Int`는 이미 `Hashable`이었다.
- 이로써 문자열 인덱스 등을 서브스크립트 인자로 사용하는 키 경로를 만들 수 있다. 모든 사용자 정의 `Collection.Index`에 `Hashable`을 요구하는 변경은 아니다.

<br/>
## Protocol의 associated type에 재귀적 조건문선언이 가능해졌다.

evolution: [SE-0157](https://github.com/apple/swift-evolution/blob/master/proposals/0157-recursive-protocol-constraints.md)

~~~swift
protocol Hi {
	associatedtype Hello
	associatedtype World: Hi where World.Hello == Hello, World.World == World
}
~~~
- 어따 쓰면 좋을지 아직 모르겠지만, 어쨌건 프로토콜의 where절을 사용할 때 지금껏 안되던 것이 되겠다는 희망이 생김

<br/>
## Protocol에서 `weak`, `unowned` 지시자 제거

evolution: [SE-0186](https://github.com/apple/swift-evolution/blob/master/proposals/0186-remove-ownership-keyword-support-in-protocols.md)

- 프로토콜 프로퍼티 요구사항의 `weak`, `unowned`는 채택하는 타입의 저장 프로퍼티 소유권을 강제하지 못했다. SE-0186은 이 오해하기 쉬운 표기를 제거한다.
- Swift 3·4 언어 모드에서는 경고, Swift 5 언어 모드에서는 오류로 전환하는 계획이다. Xcode 9.3의 `@objc` 프로토콜은 생성되는 Objective-C 헤더에 영향을 주어 경고 대상에서 제외된 예외도 있으므로, 4.1에서 곧바로 모든 경우가 오류였다고 읽으면 안 된다. [당시 릴리스 노트 기록](/blog/xcode9-3-release-note/)

<br/>
## Collection의 Index Distances

evolution: [SE-0191](https://github.com/apple/swift-evolution/blob/master/proposals/0191-eliminate-indexdistance.md)

- Collection에서 IndexDistance의 associatedtype을 제거하고, typealias를 통해 Int로 치환했다.
- 따라서 Collection IndexDistance타입에 대해 더 이상 신경쓰지 않아도 된다.

<br/>

## Structure Initializers in Modules

evolution: [SE-0189](https://github.com/apple/swift-evolution/blob/master/proposals/0189-restrict-cross-module-struct-initializers.md)

- struct를 별도의 모듈에서 확장하며, self의 프로퍼티에 값을 설정할 수 있었는데, 이것을 `self.init(..)` 혹은, `self = ...`로 명확하게 제한한다.
    - 위반시, swift 4에서는 경고, swift 5에서는 에러가 된다.

<br/>

# 설정과 빌드

## Build imports

evolution: [SE-0075](https://github.com/apple/swift-evolution/blob/master/proposals/0075-import-test.md)

- 드디어 모듈 임포트 가능 여부를 체크 할 수 있다.

~~~swift
#if canImport(UIKit)
...
#endif
~~~

## Target Environments

evolution: [SE-0190](https://github.com/apple/swift-evolution/blob/master/proposals/0190-target-environment-platform-condition.md)

- 타겟(기기)를 체크할 수 있다.

~~~swift
#if targetEnvironment(simulator)
...
#endif
~~~

# 기타 등등

## Compacting Sequences

evolution: [SE-0187](https://github.com/apple/swift-evolution/blob/master/proposals/0187-introduce-filtermap.md)

- `Sequence.flatMap` 중 변환 함수가 옵셔널을 반환하고 `nil`을 제외하는 오버로드가 `compactMap`으로 분리되었다.
- 시퀀스를 펼치는 `Sequence.flatMap`과 `Optional.flatMap`은 그대로다. 모든 `flatMap`을 일괄 치환하는 변경은 아니다.

```swift
let numbers = ["1", "x", "3"].compactMap { Int($0) } // [1, 3]
let flattened = [[1, 2], [3]].flatMap { $0 }          // [1, 2, 3]
```

## Unsafe Pointers

evolution: [SE-0184](https://github.com/apple/swift-evolution/blob/master/proposals/0184-unsafe-pointers-add-missing.md)

- UnsafeMutableBufferPointer를 생성시 UnsafeMutablePointer를 사용하지 않아도 되도록 수정

## New Playground Features

evolution: [SE-0198](https://github.com/apple/swift-evolution/blob/master/proposals/0198-playground-quicklook-api-revamp.md)

- 모르겠다. 안써봐서.
