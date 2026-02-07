---
layout: post
title   : 명제 논리와 응용
summary : 
date    : 2019-02-24 22:13:24 +0900
updated : 2019-03-25 21:52:37 +0900
tags    : discrete,mathematic
toc     : true
public  : true
parent  : discrete_mathematics
parenttitle : 이산수학
latex   : false
---
* TOC
{:toc}

# 1. 기초: 논리와 증명
논리는 수학적 의미를 구체화하며, 증명은 컴퓨터 사이언스에서 매우 중요하다. 여기서는 수학적 논증이 무엇으로 되어있는지 배운다.

## 1.1 명제 논리
### 서론
    논리규칙은 수학적의미를 명확하게 작성하도록 할 수 있다.
### 명제
    명제는 문장에서 참 거짓을 판별할 수 있는 선언적 문장이다.
- 명제
    - 한국의 수도는 서울이다.
    - 일본의 수도는 도쿄다.
    - 1 + 1 = 2
- 명제가 아닌 경우
    - 몇 시인가요?
    - 잘자
    - x + 1 = 2

하나 혹은 여러 개의 명제를 조합하여 만드는 명제를 **복합명제(compound propositions)** 라고 하며, **The Laws of Though**에서 George Boole이 논의했다.


### 조건문
p와 q가 명제라면, 조건문 `p -> q`는 명제 `if p then q`이다.

### 논리 수수께끼
`항상 진실만을 이야기하는 기사 계급과 항상 거짓만을 이야기하는 악한들이 사는 섬이 있다. 당신이 A와 B를 만났을 때, A는 "B는 기사계급이다." 라고 이야기하고, B는 "우리는 서로 계급이 다르다" 라고 했다면 누가 어느 계급에 속하는가?`

1. 명제
여기에서 계급은 두 가지이다. 기사계급과 악한계급. positive를 기사계급으로 negative를 악한으로 정하면 postive와 postive의 not조건으로 수식작성이 가능하다.
- 정의
p: A는 기사계급이다.
q: B는 기사계급이다.

p 가 참이라면 q 또한 참이다. B는 기사계급이 맞다면, 서로 계급이 다른 조건인 $$ (p and not q) or (not p and q) $$ 도 참이 되어야 하지만, 답은 false인 거짓이 된다. 결론은 A는 거짓말을 했고 악한이다. B 또한 거짓말을 했고 악한이다. p가 거짓이라면 p = false라면 q또한 false가 되고 위의 식은 참이된다.


## 1.4 술어와 한정 기호
- 술어
    - $$x > 3$$.
    - $$x = y + 3$$.
    - $$x + y = z$$.
    - computer x is under attack by an intruder.
    - computer x is functioning properly.
    - 변수를 포함하는 문장, 값이 정해지지 않으면 참 거짓 판별 불가
    - x is greater than 3
        - 두 문장으로 구성
        - 변수 x
        - is greater than 3 <- predicate(술어)
        - $$P(x) = x is greater than 3$$ 표현 가능
        - P(x)
            - P -> is greater than 3
            - x -> x
- 전조건과 후조건(PRECONDITIONS AND POSTCONDITIONS)
    - 술어는 컴퓨터 프로그램이 입력에 대해 원하는 출력을 산출한다는 것을 확증하는데 사용
    - preconditions -> 올바른 입력을 기술
    - postconditions -> 프로그램 수행시 출력이 만족해야 하는 조건
- 예제 7. 다음 프로그램의 전조건과 후조건을 술어를 구하자.
```
temp := x
x := y
y := temp
```
    - x 와 y의 값을 치환
    - x 와 y가 어떤 값을 가지고 있다는 것을 표현할 필요가 있다.
    - 전조건
        - a와 b가 값이라고 가정
        - 술어: x = a이고 y = b
        - P(x, y)
    - 후조건
        - 모든 입력 값에 대해 값의 교환이 발생
        - x = b 이고 y = a
        - Q(x, y)
- 한정화(quantifier)
    - 명제 -> 명제함수의 모든 변수에 값이 할당 되어 참 거짓이 판별이 가능한 경우.
    - 한정화 -> 명제함수로부터 명제를 생성
    - 사용단어 -> all, some, many, none, few 등
    - 전칭 한정기호(universal quantifier)
    - 존재 한정기호
