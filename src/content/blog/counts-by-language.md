---
title   : 프로그래밍 언어별 문자열 세기
summary : 
date    : 2018-04-19 23:06:57 +0900
updated : 2018-04-19 23:30:15 +0900
tags    : study 
---

> **검토·정정 (2026-10-28)** Swift 4.1 시절 작성한 학습 메모입니다. UTF-8/UTF-16의 코드 유닛을 코드 포인트로 잘못 적은 부분을 정정했습니다. Java 비교는 아직 작성하지 않았습니다.

# Swift 4.1

같은 문자열도 무엇을 세는지에 따라 길이가 다르다. 가족 이모지 `👩‍👩‍👧‍👦`는 네 사람의 이모지를 세 개의 ZWJ(U+200D)로 연결한 시퀀스다.

| 세는 단위 | 개수 | 의미 |
| --- | ---: | --- |
| 확장 그래핌 클러스터 (`Character`) | 1 | Swift가 문자로 묶어 다루는 단위 |
| Unicode scalar | 7 | 네 사람 이모지와 세 개의 ZWJ |
| UTF-8 코드 유닛 | 25 | 코드 유닛 하나가 1바이트 |
| UTF-16 코드 유닛 | 11 | 코드 유닛 하나가 2바이트 |

~~~swift
import Foundation // lengthOfBytes(using:)에 필요

let family = "👩‍👩‍👧‍👦"
family.count // 1: 확장 그래핌 클러스터 수
family.utf8.count // 25: UTF-8 코드 유닛 수 (= 바이트 수)
family.lengthOfBytes(using: .utf8) // 25: UTF-8로 인코딩한 바이트 수
family.utf16.count // 11: UTF-16 코드 유닛 수
family.lengthOfBytes(using: .utf16) / 2 // 11: 바이트 수를 코드 유닛 크기로 나눔
family.unicodeScalars.count // 7: Unicode scalar 수
family.lengthOfBytes(using: .utf32) / 4 // 7: 이 문자열의 UTF-32 코드 유닛 수
~~~

[`underestimatedCount`](https://developer.apple.com/documentation/swift/string/underestimatedcount)는 실제 원소 수를 넘지 않는 **하한값**이다. 이 예제에서 특정 값을 반환하더라도 정확한 문자 수를 구하는 API로 사용하면 안 된다. 정확한 `Character` 수가 필요하면 `count`를 쓴다.

UTF-16의 11은 코드 포인트 수가 아니다. 이 예제에서 사람 이모지 네 개는 각각 서로게이트 쌍 두 코드 유닛, ZWJ 세 개는 각각 한 코드 유닛으로 표현되어 `4 × 2 + 3 = 11`이 된다. UTF-8에서는 `4 × 4 + 3 × 3 = 25`바이트다.

참고: [Swift String](https://developer.apple.com/documentation/swift/string), [Strings and Characters](https://docs.swift.org/latest/documentation/the-swift-programming-language/stringsandcharacters/). 위 수치는 이 리터럴의 단위별 구성 설명이며, 모든 이모지가 같은 길이라는 뜻은 아니다. 이번 검토에서는 Swift 4.1 런타임을 다시 실행하지 않았다.

# Java 9 — 미작성

Java와의 비교 예제는 아직 없다. 언어 간 비교를 추가할 때도 문자·코드 포인트·코드 유닛을 구분해야 한다.
