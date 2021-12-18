---
layout  : wiki
title   : 구체수학
summary : 
date    : 2018-06-01 08:52:52 +0900
updated : 2018-06-05 09:03:36 +0900
tags    : 
toc     : true
public  : true
parent  : study
parenttitle : study
latex   : false
---
* TOC
{:toc}

# Concrete Mathematics: 구체수학

## 1장 재귀적인 문제들

### 1. 하노이의 탑

*수학을 하나의 새로운 프로그래밍 언어로 생각하고 접근해보자*

[[mathematical_induction]]{수학적 귀납법}

나는 항상 정의와 조건과 실질적 함수를 헷갈려했다. **명심**

Tn >= 2 * T(n-1) + 1 <- 이건 T라는 함수의 재귀함수(수학에서는 점화식이다아!! 젠장!!)

### 2. 평면의 선들

1. n은 선의 갯수
2. (n = 0)인 경우 최대 화면은 1개
3. (n = 1)인 경우 최대 화면은 4개
4. (n = 2)연 경우 최대 화면은 7개
