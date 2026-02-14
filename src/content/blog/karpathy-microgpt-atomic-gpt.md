---
title: Karpathy의 microgpt.py, GPT의 원자적 구현 읽기
date: 2026-02-14 18:40:00 +0900
categories: [AI, LLM, Python]
summary: 의존성 없는 단일 파이썬 파일로 GPT 학습과 추론의 본질을 구현한 karpathy의 microgpt.py를 구조적으로 해설합니다.
tags: [karpathy, microgpt, gpt, transformer, autograd, adam]
---

Andrej Karpathy의 gist([microgpt.py](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95))는 아주 선명한 선언으로 시작합니다.

> “The most atomic way to train and inference a GPT in pure, dependency-free Python.
> This file is the complete algorithm. Everything else is just efficiency.”

이 문장은 이 코드의 목적을 정확히 말해줍니다. 
**실용적 성능**이 아니라 **알고리즘의 본질**을 가장 작은 단위로 보여주는 것.

---

## 한 줄 요약

`microgpt.py`는 다음을 **파일 하나**에 담습니다.

- 문자 단위 토크나이저
- 스칼라 기반 오토그라드(`Value`)
- GPT 블록(멀티헤드 어텐션 + MLP)
- cross-entropy loss 계산
- Adam 최적화
- temperature 샘플링 추론

즉, “GPT가 어떻게 학습되고 말(토큰)을 뽑아내는가”의 전체 루프를 압축한 교과서입니다.

---

## 1) 데이터와 토크나이저: 가장 작은 언어 단위

코드는 기본적으로 `names.txt`를 받아와 학습합니다. 토크나이저는 BPE가 아니라 **문자 단위**입니다.

- 데이터셋의 고유 문자 집합을 vocab으로 사용
- `BOS`(Beginning of Sequence)를 특수 토큰으로 추가
- 문서(이름)를 `[BOS] ... [BOS]` 형태로 감싸 시퀀스 학습

이 설계는 단순하지만, 다음 토큰 예측(next-token prediction)의 핵심 개념을 보기에 충분합니다.

---

## 2) `Value` 클래스: 스칼라 오토그라드의 정수(精髓)

핵심 미학은 여기 있습니다. 텐서 라이브러리 없이 스칼라 연산 그래프를 직접 만듭니다.

- 각 `Value`는 `data`, `grad`를 가짐
- `+`, `*`, `pow`, `log`, `exp`, `relu` 같은 연산에서
  - 자식 노드(`_children`)
  - 로컬 미분값(`_local_grads`)
  을 저장
- `backward()`에서 토폴로지 정렬 후 역전파

이 방식은 PyTorch가 내부적으로 하는 일을 아주 작은 조각으로 드러냅니다.

---

## 3) 모델 구조: GPT-2의 축약판

코멘트대로 “GPT-2를 따르되 약간 단순화”했습니다.

- LayerNorm 대신 `rmsnorm`
- bias 제거
- GeLU 대신 ReLU
- 블록 구성은 동일한 흐름
  1. Attention sub-layer + residual
  2. MLP sub-layer + residual

`n_embd=16`, `n_head=4`, `n_layer=1`, `block_size=16`으로 매우 작게 잡아, 개념 전달에 집중합니다.

---

## 4) 어텐션 구현 포인트

어텐션 계산은 textbook 형태로 읽힙니다.

1. 현재 토큰에서 `q, k, v` 생성
2. 과거 시점의 `keys/values`를 캐시해 누적
3. 헤드별로
   - `q·k / sqrt(d)`
   - softmax
   - 가중합으로 head output
4. 헤드 결합 후 output projection

중요한 점은 **자동회귀(autoregressive)** 맥락이 코드 레벨에서 눈에 보인다는 것입니다. 
현재 시점은 과거의 `k,v`만 볼 수 있습니다.

---

## 5) 학습 루프: 손실 → 역전파 → Adam

각 step에서 문서 하나를 꺼내 시퀀스를 훑으며 손실을 누적합니다.

- 시점별 확률 `probs = softmax(logits)`
- 정답 토큰의 음의 로그 우도 `-log p(target)`
- 평균 loss 계산
- `loss.backward()`
- Adam으로 파라미터 업데이트
- 학습률 선형 감쇠(`lr_t = lr * (1 - step / num_steps)`)

이 구조는 현대 딥러닝 코드의 골격과 완전히 동일합니다. 
단지 “고성능 텐서 연산” 레이어를 걷어냈을 뿐입니다.

---

## 6) 추론: temperature 샘플링

학습 후에는 `BOS`에서 시작해 토큰을 하나씩 생성합니다.

- logits를 `temperature`로 스케일링
- softmax 후 확률 샘플링
- `BOS`가 나오면 종료

데모는 “새로운 이름 생성”이라 결과가 직관적입니다.

---

## 왜 이 코드가 중요한가

### 1. 지식 압축
수천 줄 프레임워크 코드를 보기 전에, 핵심을 200줄대 코드로 먼저 grasp할 수 있습니다.

### 2. 디버깅 감각
수식이 코드로 어떻게 번역되는지 보이기 때문에, 모델 디버깅 감각이 빨리 생깁니다.

### 3. 교육용 기준점
“무엇이 본질이고 무엇이 최적화인가”를 구분하는 기준점을 만들어 줍니다.

Karpathy의 말처럼, 나머지는 대부분 효율의 문제입니다.

---

## 한계도 분명하다

- 스칼라 오토그라드라 매우 느림
- 배치 처리/벡터화 없음
- 실제 대규모 데이터·모델에는 부적합
- 안정화 기법/엔지니어링 요소 최소화

그래서 이 코드는 **프로덕션용**이 아니라 **개념용**입니다.

---

## 실전으로 연결하려면

이 gist를 본 뒤 다음 순서로 넘어가면 좋습니다.

1. 동일 구조를 NumPy 벡터화로 재구현
2. PyTorch 모듈(`nn.Embedding`, `nn.MultiheadAttention` 유사 구조)로 매핑
3. 미니배치/마스킹/체크포인트/평가 루프 추가
4. 토크나이저를 문자 단위에서 subword(BPE/SentencePiece)로 교체

이렇게 가면 “원리 → 실전” 다리가 깔끔하게 이어집니다.

---

## 마무리

`microgpt.py`는 GPT를 신비화하지 않습니다. 
오히려 아주 담백하게 말합니다.

- 예측은 확률이다.
- 학습은 미분과 최적화다.
- 모델은 반복되는 블록이다.

그리고 우리에게 남는 질문은 이것입니다.

> 복잡함의 본질은 알고리즘에 있는가,
> 아니면 규모(scale)와 효율(engineering)에 있는가?

이 작은 파일은 그 질문에 대해, 꽤 설득력 있는 답을 줍니다.
