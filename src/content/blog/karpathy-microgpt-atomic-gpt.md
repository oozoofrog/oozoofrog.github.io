---
title: Karpathy의 microgpt.py 읽기
summary: GPT 학습/추론의 핵심을 의존성 없는 단일 파이썬 파일로 구현한 microgpt.py 정리
date: 2026-02-14 18:40:00 +0900
categories: [AI, LLM, Python]
tags: [karpathy, microgpt, gpt, transformer, autograd, adam]
---

Karpathy의 `microgpt.py`를 읽어봤다.

- 원문: [https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95)

이 코드는 성능 최적화보다는 **원리 설명**에 집중한 코드다.
파일 하나에 GPT 학습과 추론의 핵심 흐름이 다 들어있다.

## 이 파일 하나에 들어있는 것

- 문자 단위 토크나이저
- 스칼라 오토그라드(`Value`)
- Transformer 블록(Attention + MLP)
- 손실 계산과 역전파
- Adam 최적화
- temperature 기반 샘플링

즉, 학습부터 추론까지 한 바퀴를 최소 단위로 보여준다.

## 1) 데이터와 토크나이저

기본 데이터는 `names.txt`를 받아서 사용한다.
토크나이저는 BPE가 아니라 문자 단위다.

- 고유 문자 집합으로 vocab 구성
- `BOS` 토큰 추가
- `[BOS] ... [BOS]` 형태로 시퀀스 학습

단순하지만 next-token prediction을 이해하기엔 충분하다.

## 2) `Value` 클래스 (핵심)

가장 중요한 부분은 오토그라드 구현이다.

- 각 노드는 `data`, `grad`를 가진다.
- 연산 시 자식 노드와 local grad를 저장한다.
- `backward()`에서 토폴로지 순회로 gradient를 전파한다.

프레임워크 뒤에 숨겨진 자동미분 과정을 코드 수준에서 직접 볼 수 있다.

## 3) 모델 구조

GPT-2 계열 구조를 단순화해서 구현했다.

- LayerNorm → RMSNorm
- GeLU → ReLU
- bias 제거

흐름은 동일하다.

1. Attention + residual
2. MLP + residual

모델 크기(`n_embd=16`, `n_layer=1`)는 매우 작아서 개념 파악에 유리하다.

## 4) Attention 구현

시점별로 `q, k, v`를 만들고,
과거 `keys/values`를 캐시해서 가중합을 구한다.

- `q·k / sqrt(d)`
- softmax
- weighted sum

자동회귀 구조가 직관적으로 드러난다.
현재 토큰은 과거 정보만 본다.

## 5) 학습 루프

학습 루프는 정석 그대로다.

- 다음 토큰 확률 계산
- `-log p(target)` 누적
- 평균 loss 계산
- `loss.backward()`
- Adam 업데이트
- linear lr decay

실전 코드와 다른 점은 규모와 최적화 레이어뿐이다.

## 6) 추론

`BOS`에서 시작해 토큰을 하나씩 샘플링한다.
`temperature`로 분포를 조정하고,
다시 `BOS`가 나오면 종료한다.

데모 데이터가 이름 목록이라 결과 확인도 쉽다.

## 이 코드가 좋은 이유

1. **본질이 분리되어 보임**
   - 알고리즘과 최적화를 구분해서 이해할 수 있다.

2. **디버깅 감각에 도움됨**
   - 수식이 코드로 내려오는 과정이 명확하다.

3. **교육용 기준점으로 좋음**
   - 큰 프레임워크로 가기 전에 최소 완성본을 볼 수 있다.

## 한계

- 스칼라 연산이라 느림
- 배치/벡터화 없음
- 대규모 학습용으로는 부적합

즉, production 코드가 아니라 개념 학습용 코드다.

## 다음 단계

이 코드를 본 다음에는 보통 다음 순서가 좋다.

1. NumPy 벡터화 버전 구현
2. PyTorch로 1:1 대응 구현
3. 배치/평가/체크포인트 추가
4. subword 토크나이저로 확장

---

정리하면, `microgpt.py`는 GPT를 신비하게 포장하지 않고 핵심만 보여준다.

- 예측은 확률 계산
- 학습은 미분 + 최적화
- 모델은 반복 블록 구조

짧은 코드인데도 배울 수 있는 밀도가 높다.