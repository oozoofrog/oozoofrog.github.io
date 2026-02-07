---
layout: post
title   : Coding the Matrix
summary : 
date    : 2018-04-12 21:53:45 +0900
updated : 2018-04-12 23:20:58 +0900
tags    : linear_algebra python
toc     : true
public  : true
parent  : study
latex   : false
---
* TOC
{:toc}

* 내 목표는 최종적으로 이 책의 소스들을을 스위프트로 구현하는 것이다.*

# Coding the Matrix

## Chapter 1

### 함수

#### 1.1 집합에 대한 용어와 표기법
- 1 $$\in$$ [1, 2, 3, 4] 와 같이 기호 $$\in$$은 좌측의 값이 우측집합에 속하는 것을 나타낸다.

#### 1.2 카테시안 곱([Cartesian](Cartesian) product)
- 두 집합 A와 B의 카테시안 곱은 a $$\in$$ A, b $$\in$$ B의 모든 쌍 (a, b)로 이루어진 집합
- 두 집합의 크기는 두 집합의 요소의 갯수의 곱과 같다.

#### 1.3 함수
**정의**
- 비공식 <br/>입력(pre-image) 집합 D의 각 원소에 대한 출력(image) 가능한 규칙
- 공식 <br/>(a, b)쌍의 유한에서 무한까지의 집합. 각 쌍의 첫 번째 원소는 모두 다름.

**표기** <br/>$$f: D \to F$$
