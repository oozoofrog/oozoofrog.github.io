---
title   : 이산수학
summary : 이산수학을 배우자
date    : 2019-02-21 23:49:35 +0900
updated : 2019-03-15 22:51:59 +0900
tags    : discrete,mathematics,computerscience
toc     : true
public  : true
parent  : study
parenttitle : 공부, 그리고 공부
latex   : false
---

> **검토·정정 (2026-10-28)** 이산수학을 시작하며 적은 공부 메모입니다. 이산수학을 위상공간만으로 설명한 부분과 위상의 정의를 정정했습니다.

# 이산수학이란?
정수, 명제, 집합, 그래프처럼 이산적인 구조를 다루는 수학이다. 처음에는 정수 집단을 다루는 수학이라고 생각했지만, 정수에 관한 문제만으로 범위를 좁히면 안 되겠다. 논리와 조합, 그래프도 함께 공부할 내용이다. 이산수학 전체를 ‘연속적이지 않은 위상공간을 다루는 수학’이라고 정의하는 것은 부정확하다.
# 위상공간이란?
위상은 집합 X의 부분집합 **하나**가 아니라, 부분집합들을 모은 모음 T다. T가 다음 조건을 만족하면 X 위의 **위상(topology)**이라고 부른다.

1. 공집합과 X가 T에 속한다.
2. T에 속하는 집합들의 임의의 합집합이 T에 속한다.
3. T에 속하는 유한 개 집합의 교집합이 T에 속한다.

이때 **위상공간(topological space)**은 X와 T를 함께 묶은 `(X, T)`다. X의 모든 부분집합을 T로 택하면 이산위상이라는 예가 되지만, 이것이 이산수학 전체의 정의는 아니다.

참고: T. W. Körner의 [Metric and Topological Spaces](https://www.dpmms.cam.ac.uk/~twk10/Top.pdf), Definition 5.1.

# 무엇으로 공부하나?
Rosen의 이산수학 책으로 한다.

1. [기초: 논리와 증명](/blog/the-foundations-logic-and-proofs/)

