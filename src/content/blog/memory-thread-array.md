---
date: 2016-07-18 09:25:57+00:00
title: 메모리, 스레드 그리고 배열(Array)
categories:
- swift
---

> **2026-10-28 검토·정정:** 2016년 Swift 2.x 학습 글입니다. “대입 즉시 물리적 복사”, “append는 복사하지 않음”, “8바이트 단위 증설”이라는 설명을 당시 Swift 2.2 소스에 맞게 바로잡았습니다. 아래 값 비교는 설명용이며, 과거 포인터 주소로 복사 시점을 판단하던 예제는 본문에서 분리해 하단에 역사적 기록으로 보존했습니다. 이번 검토에서 Swift 2.x를 재실행하지는 않았습니다.

## Memory

스위프트와 Objective-C의 배열은 상호 변환이 매우 쉽지만, 둘은 다른 타입입니다. Swift의 `Array`는 값 타입이고, Objective-C의 `NSArray`, `NSMutableArray`는 참조 타입입니다.

Objective-C의 변경 가능한 배열을 Swift에서 다뤄보겠습니다.

```swift
import Foundation

let original = NSMutableArray(objects: "1")
let new = original
new.addObject("2") // Swift 2.x
```

이 경우 `original`과 `new`는 동일한 객체를 참조합니다. `new`를 통해 객체를 변경하면 `original`을 통해서도 그 변화가 보이겠죠.

Swift 배열의 경우를 볼까요?

```swift
var original = ["1"]
var new = original
new.append("2")
print(original) // ["1"]
print(new)      // ["1", "2"]
```

`original`은 변하지 않습니다. 이것이 값 의미론입니다. 하지만 **대입하는 즉시 내부 저장 공간 전체를 복사한다는 뜻은 아닙니다.** Swift 2.2의 배열도 copy-on-write(COW)를 사용했습니다. 버퍼를 공유하다가 한쪽을 변경할 때, 독립적인 값을 유지하기 위해 필요한 복사를 합니다. 배열이 클래스 인스턴스를 담으면 배열 안의 참조 값은 복사되지만 그 객체 자체까지 깊은 복사되는 것은 아닙니다.

`+=`와 `append`를 “복사하는 연산”과 “복사하지 않는 연산”으로 나눌 수도 없습니다. 둘 다 변경 연산입니다. 버퍼가 공유 중인지, 여유 용량이 충분한지에 따라 복사나 재할당이 필요할 수 있습니다. 용량 증가도 고정된 8바이트 단위가 아닙니다. `count`와 `capacity`를 구별하고, 필요한 개수를 안다면 `reserveCapacity`를 검토하면 됩니다.

예전 글에서는 배열을 임시 포인터로 변환한 주소를 비교했습니다. 그런 주소는 변수 자체의 주소도 아니고, 그 값만으로 COW나 할당 정책을 증명할 수도 없습니다. 값의 독립성 확인과 저장 공간 관찰은 구분해야겠네요.

## Thread

단도직입적으로 말하면, **하나의 변경 가능한 배열 변수에 여러 스레드가 동기화 없이 접근하고 그중 하나라도 쓴다면 데이터 경쟁이 생깁니다.** COW가 그 접근을 직렬화해주지는 않습니다. 변경이 없는 배열을 여러 곳에서 읽는 경우와도 구별해야 합니다.

아래는 Swift 2.x 당시의 잘못된 접근을 보여주는 예제입니다. 제품 코드로 사용하지 마세요.

```swift
var values = ["1001"]
let queue = dispatch_queue_create("apply", DISPATCH_QUEUE_CONCURRENT)
for index in 0..<10 {
    dispatch_async(queue) {
        values.append("\(index)") // 같은 변수에 동시 쓰기: 데이터 경쟁
    }
}
```

결과 누락, 메모리 손상, 크래시가 생길 수 있지만 어느 결과도 보장되지 않습니다. 마지막에 barrier를 넣어 출력해도 앞서 일어난 동시 쓰기가 안전해지지는 않습니다.

당시 GCD로 해결한다면 동일한 직렬 큐에 **모든 읽기와 쓰기**를 모으는 식으로 소유권을 정해야 합니다. 현재 Swift에서는 actor 격리 같은 방식도 검토할 수 있습니다. 배열뿐 아니라 dictionary 등 공유 가변 상태에도 같은 주의가 필요합니다.

### 참고

- [Swift 2.2 배열 구현: Value Semantics / Growth and Capacity](https://github.com/swiftlang/swift/blob/swift-2.2-RELEASE/stdlib/public/core/Arrays.swift.gyb#L92-L132)
- [Swift 데이터 경쟁 안전성 안내](https://www.swift.org/migration/documentation/swift-6-concurrency-migration-guide/dataracesafety/)
- [다음 글: 메모리, 스레드 그리고 배열 2](/blog/memory-thread-array-2/)


<details>
<summary>당시 실험 코드와 출력 보관 (실행용 아님)</summary>

**2016년 원자료:** 아래에는 깨진 출력문, 임시 포인터 주소 비교, 동기화 없는 공유 쓰기가 포함되어 있습니다. 코드와 주소 기록을 보존한 것이며 올바른 예제나 새로운 측정 결과가 아닙니다. 값 의미론·버퍼 할당·경쟁 조건에 대한 해석은 위 정정 본문을 따릅니다.

```swift
let original = NSMutableArray(objects: "1")
    let new = original
```

```swift
func address(o: UnsafePointer<Void>) -> Int {
        return unsafeBitCast(o, Int.self)
    }

    var original = ["1"]
    var new = original
    print(address(original)) // original변수의 메모리 번지
    print(address(new)) // new변수의 메모리 번지
```

```swift
func address(o: UnsafePointer<Void>) -> Int {
        return unsafeBitCast(o, Int.self)
    }

    var original = ["1"]
    var new = original
    new += ["2"]
    print("original => \(original):\(address(original)") // original변수의 메모리 번지
    print("") // new변수의 메모리 번지
```

```swift
print("new => \(new):\(address(new))")
    //new => ["1", "2"]:7fb3bbe0d5e0<br/>
    new += ["3"]
    print("new => \(new):\(address(new))")
    new.append("100")
    //new => ["1", "2", "3"]:7fb3bd001350<br/>
    print("new => \(new):\(address(new))")
    //new => ["1", "2", "3", "100"]:7fb3bd001350<br/>
    new.append("1001")
    print("new => \(new):\(address(new))")
    //new => ["1", "2", "3", "100", "1001"]:7fb3bd201b50
```

```swift
var new = ["1001"]
    let queue = dispatch_queue_create("apply", DISPATCH_QUEUE_CONCURRENT)
    for index in 0..<10 {
        dispatch_async(queue, {
            new += ["\(index)"]
            //or
            new.append("\(index)")
        })
    }

    dispatch_barrier_async(queue) {
        print("")
        print(new)
        print(new.count)
    }
```

당시 기록한 출력:

```text
original => ["1"]:7ffb2c001ad0
new => ["1", "2"]:7ffb295130b0
```

</details>
