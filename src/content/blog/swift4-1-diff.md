---
title: 스위프트 4.1 변경사항 요약
date    : 2018-04-09 00:00:00 +0900
parent: swift
---

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
struct Int: Valuable {}

extension Property: Equatable where Value: Equatable {
	static func == (lhs: Property<Value>, rhs: Property<Value>) -> Bool {
		return lhs.property == rhs.property && lhs.value == rhs.value
	}
}

let t1 = Property(property: "t1", value: 1)
let t2 = Property(property: "t2", value: 1)

print(t1 == t2)
~~~
- 4.0까지는 상속 확장같은 제약조건이 있는 경우 where contaraint를 쓸 수가 없었지만, 4.1부터는 가능해졌다.

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
- 명시적으로 == 함수나 hashValue 프로퍼티를 선언하지 않아도 된다.

<br/>
## Hashable Index Types

evolution: [SE-0188](https://github.com/apple/swift-evolution/blob/master/proposals/0188-stdlib-index-types-hashable.md)

- 배열의 index type이 Hashable이 되었다. 따라서 KeyPath로 사용이 가능하다.

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

- protocol에서 프로퍼티를 정의할 때, `weak`, `unowned`를 사용할 수 있었는데, 의미가 없는 선언자이기 때문에 사용하지 못하도록 제거

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

- flatMap함수의 이름이 역할과의 관계가 모호했다.
- 그래서 compactMap으로 바꿈

## Unsafe Pointers

evolution: [SE-0184](https://github.com/apple/swift-evolution/blob/master/proposals/0184-unsafe-pointers-add-missing.md)

- UnsafeMutableBufferPointer를 생성시 UnsafeMutablePointer를 사용하지 않아도 되도록 수정

## New Playground Features

evolution: [SE-0198](https://github.com/apple/swift-evolution/blob/master/proposals/0198-playground-quicklook-api-revamp.md)

- 모르겠다. 안써봐서.
