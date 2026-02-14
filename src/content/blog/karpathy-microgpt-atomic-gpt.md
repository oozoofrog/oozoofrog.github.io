---
title: Karpathy의 microgpt.py 읽기 — GPT를 가장 작은 단위로 보기
date: 2026-02-14 18:40:00 +0900
categories: [AI, LLM, Python]
summary: Karpathy의 microgpt.py를 기준으로 GPT 학습/추론의 핵심을 가볍게 정리한 노트.
tags: [karpathy, microgpt, gpt, transformer, autograd, adam]
---

요즘 화제인 Andrej Karpathy의 gist를 읽어봤다.

- 링크: [microgpt.py](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95)

처음 문구부터 아주 명확하다.

> This file is the complete algorithm. Everything else is just efficiency.

이게 핵심인 것 같다. 
이 코드는 “실무용으로 빠른 GPT”가 아니라, **GPT가 돌아가는 본체를 최대한 작게 드러내는 코드**다.

## 이 파일 하나에 뭐가 들어있나

대충 아래가 다 들어있다.

- 문자 단위 토크나이저
- 스칼라 오토그라드(`Value`)
- GPT 블록(어텐션 + MLP)
- loss 계산
- Adam 업데이트
- temperature 샘플링

그러니까 학습부터 추론까지 한 바퀴가 파일 하나에서 끝난다.

## 데이터/토크나이저

기본 데이터는 `makemore`의 names.txt를 받아서 쓴다.
토크나이저는 BPE 같은 거 없이 문자 단위.

- 고유 문자 집합으로 vocab 구성
- `BOS` 토큰 하나 추가
- `[BOS] ... [BOS]` 형태로 시퀀스 학습

단순한데, next-token prediction 원리 보기에는 오히려 이쪽이 더 직관적이다.

## `Value` 클래스가 진짜 포인트

개인적으로는 여기서 감탄했다.

텐서 프레임워크 없이 스칼라 연산 그래프를 직접 만들고,
`backward()`에서 토폴로지 순회로 gradient를 전파한다.

- 각 노드가 `data`, `grad`를 가짐
- 연산할 때 자식 노드와 local grad를 저장
- 마지막 loss에서 역전파

PyTorch를 쓰면 당연하게 넘어가던 부분을, 이 코드는 눈으로 확인하게 해준다.

## 모델 구조는 GPT-2 축약판 느낌

코드 주석에도 나오지만 대략 이런 차이가 있다.

- LayerNorm → RMSNorm
- GeLU → ReLU
- bias 없음

그래도 큰 흐름은 익숙한 GPT 그대로다.

1. Attention + residual
2. MLP + residual

사이즈는 아주 작게 고정 (`n_embd=16`, `n_layer=1`, `block_size=16`)해서,
성능보다 구조 이해에 집중한다.

## 어텐션도 교과서처럼 보임

시점별로 `q/k/v` 만들고,
과거 `keys/values`를 누적해서 softmax 가중합하는 전형적인 형태다.

여기서 좋은 점은 “자동회귀가 뭔지”가 코드로 바로 보인다는 것.
현재 토큰은 과거 캐시만 본다.

## 학습 루프도 딱 정석

- 토큰 시퀀스 순회
- 각 위치에서 다음 토큰 확률 계산
- `-log p(target)` 누적
- 평균 loss
- `loss.backward()`
- Adam step
- linear lr decay

결국 실전 코드랑 다른 건 규모랑 효율이지, 본질은 거의 동일하다는 걸 확인하게 된다.

## 추론

`BOS`에서 시작해서 토큰 하나씩 샘플링하고,
다시 `BOS`가 나오면 종료.

데이터가 이름 목록이라 결과도 “새 이름 생성”으로 바로 보인다.
교육용 예제로 깔끔하다.

## 왜 이 코드가 좋았냐면

1. **핵심이 분리돼서 보임**  
   프레임워크 API를 걷어내니 알고리즘이 전면에 나온다.

2. **디버깅 감각이 생김**  
   수식이 코드로 어떻게 내려오는지 연결이 잘 된다.

3. **본질/최적화 구분이 쉬움**  
   “무엇이 모델이고, 무엇이 엔지니어링인가”가 분명해진다.

## 한계도 명확함

당연히 느리다. 아주 느리다.

- 스칼라 오토그라드
- 배치/벡터화 없음
- 대규모 학습 불가

그래서 이건 production 코드가 아니라, 개념을 뚫는 코드다.

## 다음에 해볼만한 것

이 gist를 본 다음 단계로는 이런 순서가 자연스럽다.

1. NumPy로 벡터화 버전 만들기
2. PyTorch 모듈로 1:1 대응 구현
3. 배치/평가/체크포인트 붙이기
4. 토크나이저를 subword로 교체

---

정리하면,
`microgpt.py`는 GPT를 신비하게 만들지 않고 그냥 해부해서 보여준다.

- 예측은 확률 문제
- 학습은 미분 + 최적화 문제
- 모델은 반복되는 블록 구조

코드가 작아서 더 강력한 사례였다. 
가끔은 큰 프레임워크 문서보다 이런 파일 하나가 훨씬 잘 이해된다.
