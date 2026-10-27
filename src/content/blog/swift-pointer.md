---
title: Swift pointers cheat sheet
date    : 2016-11-24 00:00:00 +0900
---

> **2026-10-28 검토·정정:** Swift 3 시기의 C 연동 학습 메모입니다. 함수 포인터 표기와 임시 포인터 수명을 정정하고 정렬과 stride를 구분했습니다. 모든 C 선언의 자동 변환을 망라한 표는 아니며, Objective-C 객체 포인터는 소유권 한정자와 importer 결과도 확인해야 합니다. 예제는 이번 검토에서 컴파일하지 않았습니다.

C와 Swift의 포인터 — 학습 메모
======

| c | swift |
| :------| :--------- |
| const Type * | UnsafePointer\<Type\> |
| const void * | UnsafeRawPointer |
| Type * | UnsafeMutablePointer\<Type\> |
| void * | UnsafeMutableRawPointer |

<br/>
**Objective-C 클래스 포인터**

이 표의 `Type`은 Objective-C 클래스입니다. 일반 C 타입의 이중 포인터 변환표가 아닙니다. 실제 Swift 타입의 Optional 여부는 nullability에, 소유권 표현은 ARC 한정자에 영향을 받습니다.

| c | swift |
| :----- | :------- |
| Type * const * | UnsafePointer\<Type\> |
| Type * __strong * | UnsafeMutablePointer\<Type\> |
| Type ** | AutoreleasingUnsafeMutablePointer\<Type\> |

<br/>
**함수**

| c | swift |
| :----- | :------- |
| int (*) (void) | `@convention(c) () -> Int32` |

<br/>
**Null**

| c | swift |
| :----- | :------- |
| const Type * \_Nonnull | UnsafePointer\<Type\> |
| const Type * \_Nullable | UnsafePointer\<Type\>? |
| const Type * \_Null_unspecified | UnsafePointer\<Type\>! |

<br/>
**포인터의 계산**

C의 `*(p + 1)`처럼 Swift에서도 포인터를 이동할 수 있습니다. 단, 배열을 암시적으로 변환한 임시 포인터를 변수에 저장하고 다음 문장에서 쓰면 수명이 보장되지 않습니다. 아래처럼 버퍼가 유효한 클로저 안에서 접근합니다.

```swift
let values = [3, 2, 1, 0]
let a = values.withUnsafeBufferPointer { buffer in
    // values에 두 번째 요소가 있다는 전제
    (buffer.baseAddress! + 1).pointee
}
// a == 2; 포인터 자체는 클로저 밖으로 반환하지 않습니다.
```

읽기 전용 포인터를 받았다고 원래 메모리의 소유권이 생기는 것은 아닙니다. 변경하려면 `withUnsafeMutableBufferPointer` 같은 적절한 API를 사용하고, 바인딩된 타입·요소 개수·초기화 여부·수명을 지켜야 합니다.

<br/>
**타입 사이즈 계산**
* C의 `sizeof`와 Swift의 `MemoryLayout`은 패딩을 다루는 방식에 주의해서 비교해야 합니다. 아래 숫자는 당시 `timeval` 예시이며 ABI에 따라 달라질 수 있습니다.

~~~
struct timeval { ... }
MemoryLayout<timeval>.size => 16, timeval의 데이터 크기
MemoryLayout<timeval>.stride => 16, 연속 저장할 때 인접한 값의 시작 주소 사이 간격(끝 패딩 포함)
MemoryLayout<timeval>.alignment => 8, 시작 주소가 충족해야 하는 정렬 단위. 값의 크기 자체를 뜻하지 않음
~~~

[Swift 공식 진단 문서: 임시 포인터의 수명](https://docs.swift.org/latest/documentation/diagnostics/temporary-pointers/)
