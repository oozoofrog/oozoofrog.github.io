---
date: 2016-07-29 06:18:20+00:00
title: Switch case 문을 위한 Custom operator 만들어보기
categories:
- swift
---

> **2026-10-28 검토:** 2016년 Swift 2 계열 문법의 실험 글입니다. 범위의 끝값 누락과 제네릭 강제 캐스팅을 바로잡았습니다. 아래 옛 문법을 현재 Swift에 그대로 붙여 넣는 예제로 보지는 말아 주세요.


오늘도 뜬금없는 글입니다. 이번에는 custom operator에 특히 switch case문에서 사용하는 custom expression pattern에 대해 써보겠습니다.

개발을 하다보면 쉽게 마주치는 if 문이 있습니다.





```swift
if 100 > number {
	print("smaller than 100")
} else if 100 <= number {
	print("equal or bigger than 100")
}
```




switch case의 풍부한 문법에 눈뜨기 시작하신 스위프트 유저라면 switch case문을 사랑하기 시작했을 겁니다.

저도 마찬가지라 저 코드를 어떻게 하면 switch case로 옮길 수 있을까 고민을 했습니다.

시작과 끝의 범위가 명확하다면

```swift
case 0...100:
	print("blah blah")
```

라는 형식도 가능합니다만, 두 번째 else if 문을 switch case 문으로 하려면






	case 100...Int.max:
        print("blah blah")






처럼 끝을 지정해야합니다. `100..<Int.max`로 쓰면 `Int.max`를 놓치므로 위처럼 닫힌 범위여야 원래 조건인 `100 <= number`와 같습니다. 아니 난 그냥 100 이상인 숫자만 체크하면 되는건데, 뭔 맥시멈 밸류까지 끌어와야 하나, 라는 생각에 커스텀 패턴을 만들어보자는 생각을 했습니다.

코드는 다음과 같습니다.


    //괜히 만들어봤습니다. 좀더 프로토콜 중심으로 구성하고 싶었는데, 제 제너릭에 대한 습득이 아직 부족하여서.. associatedtype으로는 문제가 많아 struct를 중심으로 작성합니다.
    protocol PatternComparable {}

    // 비교 operator와 비교값을 담을 수 있도록 struct를 작성합니다.
    // op - compare operator
    // to - target comparable value
    // Comparable을 제너릭으로 사용하여 Comparable을 상속하는 모든 타입에서 이 코드를 사용가능 하도록 했습니다.
    struct Pattern<C: Comparable>: PatternComparable {
        let op: (lhs: C, rhs: C) -> Bool
        let to: C
        func compare(from: C) -> Bool {
            return op(lhs: from, rhs: to)
        }
    }

    // Pattern struct를 편하게 생성할 수 있도록 만든 함수입니다.
    func patternize<C: Comparable>(op: (lhs: C, rhs: C) -> Bool, _ to: C) -> Pattern<C> {
        return Pattern<C>(op: op, to: to)
    }

    // ~=는 pattern matching operator입니다.
    // pattern - case 문에 들어가는 predicate입니다.
    // value - switch 문에 들어가는 비교값입니다.
    func ~=<C: Comparable>(pattern: Pattern<C>, value: C) -> Bool {
        return pattern.compare(value)
    }

    // 직접 tuple값으로 (예: (op: <, to: 100)) 패턴을 생성해보려 했으나 실패했습니다. tuple패턴은 switch에도 역시 tuple이 와야하더군요. swift3에서 튜플 타입에 변화가 생기면 사용가능할까 하여 놔뒀습니다.
    func ~=<C: Comparable>(pattern: (op:(lhs: C, rhs: C)->Bool, to:C), value: C) -> Bool {
        return pattern.0(lhs:value, rhs: pattern.1)
    }

    // Comparable에서 직접 Pattern struct를 생성하도록 만든 프로토콜입니다. 다만 문법상으로 순서가 애매합니다. 비교연산자의 우측에 가야할 값을 좌측으로 보내야해서 좀 헷갈린다고나 할까요. 그냥 이런것도 가능하구나 하고 생각해주시면 될 거 같습니다. 더 좋은 방식이 있다면 함께 의논해보면 좋겠습니다.
    // 예) 100보다 큰 숫자를 체크할 경우
    // case 100.patterned(>) - 이상하죠?
    protocol Patternable {}
    extension Int: Patternable {}
    extension Int8: Patternable {}
    extension Int16: Patternable {}
    extension Int32: Patternable {}
    extension Int64: Patternable {}
    extension UInt: Patternable {}
    extension UInt8: Patternable {}
    extension UInt16: Patternable {}
    extension UInt32: Patternable {}
    extension UInt64: Patternable {}
    extension Double: Patternable {}
    extension Float: Patternable {}
    extension CGFloat: Patternable {}

    extension Patternable where Self: Comparable {
        func patterned(op: (lhs: Self, rhs: Self) -> Bool) -> Pattern<Self> {
            return Pattern<Self>(op: op, to: self)
        }
    }






코드는 아래와 같은 방식으로 테스트해 볼 수 있습니다:






	let value = "test"

	switch value {
    case patternize(<=, "test1"):
        print("smaller than test1")
    case patternize(>, "tes"):
        print("bigger than tes")
    default:
        print("default")
    }

    let value1 = 100.1

    switch value1 {
    case 100.0.patterned(<=):
        print("smaller than 100.0")
    case patternize(>, 100.0):
        print("bigger than 100.0")
    default:
        print("default")
    }






결과:



>smaller than test1 bigger than 100.0

#### Comparable을 제너릭의 상속값으로 사용했기 때문에, 문자열같이 Comparable을 extension으로 가지는 모든 타입에서 사용이 가능하다는 장점이 있습니다. 그래도 if 문보다 손이 많이 가는건 어쩔 수가 없네요. 더 좋은 방법을 함께 토론할 수 있다면 좋겠습니다.



좋은 하루 되세요.

## 정정한 부분

`patterned`의 비교 타입을 `Self`와 묶었다. 원래의 별도 타입 `E`와 `self as! E`는 호출자가 서로 다른 타입을 선택할 여지를 만들고 런타임 강제 캐스팅 실패를 일으킨다. 비교 대상과 연산자는 같은 타입이어야 한다.

실무에서 단순 조건 하나를 옮기는 일이라면 `case let n where n >= 100:`도 가능하다. 커스텀 연산자는 여러 곳에서 같은 패턴을 재사용할 때 선택하면 된다. 경계값은 99, 100, `Int.max`로 확인해야 한다. [Swift의 expression pattern과 `~=` 설명](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/patterns/#Expression-Pattern)을 참고한다.
