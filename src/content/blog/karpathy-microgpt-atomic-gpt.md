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

---

## 용어 해설집

### Next-token prediction
현재까지의 토큰(문맥)을 보고 다음에 올 토큰의 확률 분포를 예측하는 방식.
대부분의 LLM 학습 목표는 이 문제를 반복해서 푸는 것이다.

### Token / 토큰
모델이 다루는 최소 단위 기호.
이 글의 예제는 **문자 단위 토큰화**를 사용한다.

### Vocabulary (vocab)
모델이 인식 가능한 토큰의 전체 집합.
문자 집합 + 특수 토큰(BOS 등)으로 구성된다.

### BOS (Beginning of Sequence)
시퀀스 시작을 나타내는 특수 토큰.
학습과 생성에서 문장 경계를 표시하는 역할을 한다.

### Logits
softmax를 통과하기 전의 점수 벡터.
값 자체는 확률이 아니고, 상대적인 크기가 중요하다.

### Softmax
logits를 확률 분포로 바꾸는 함수.
모든 토큰 확률의 합이 1이 되도록 정규화한다.

### Temperature
샘플링 시 분포의 날카로움을 조절하는 값.
- 낮을수록: 보수적/반복적
- 높을수록: 다양/창의적

### Autoregressive(자동회귀)
토큰을 한 번에 하나씩 생성하고,
이미 생성한 과거 토큰만 다음 예측에 사용하는 방식.

### Attention
현재 토큰이 과거 토큰 중 어디에 주목할지 가중치를 계산하는 메커니즘.
문맥 의존성을 학습하는 핵심 구성요소다.

### Query / Key / Value (QKV)
Attention 계산의 기본 요소.
- Query: 지금 무엇을 찾는가
- Key: 각 토큰이 가진 인덱스/식별 힌트
- Value: 실제로 가져올 정보

### Multi-head Attention
Attention을 여러 하위 공간(head)에서 병렬로 수행하는 구조.
서로 다른 관계 패턴을 동시에 학습할 수 있다.

### Residual connection
블록 입력을 블록 출력에 더해 정보 손실을 줄이는 연결.
깊은 네트워크에서 학습 안정성과 표현력을 높인다.

### MLP (Feed-forward network)
Attention 뒤에 오는 비선형 변환 블록.
토큰별 표현을 확장/압축하며 특성 변환을 수행한다.

### RMSNorm
벡터의 평균 제곱 크기 기반으로 스케일을 정규화하는 방식.
LayerNorm 대비 단순한 형태로 자주 쓰인다.

### ReLU / GeLU
신경망의 비선형 활성화 함수.
이 코드에서는 단순화를 위해 ReLU를 사용한다.

### Loss (교차엔트로피)
예측 분포와 정답 토큰 사이의 오차를 수치화한 값.
학습은 이 값을 줄이는 방향으로 진행된다.

### Negative Log-Likelihood (NLL)
정답 토큰 확률의 음의 로그.
정답 확률이 낮을수록 큰 패널티를 준다.

### Backpropagation (역전파)
loss를 기준으로 각 파라미터의 기울기(gradient)를 계산하는 과정.
연쇄법칙(chain rule)을 계산 그래프 전체에 적용한다.

### Gradient
파라미터를 조금 바꿨을 때 loss가 얼마나 변하는지 나타내는 미분값.
업데이트 방향/크기를 결정한다.

### Optimizer (Adam)
gradient를 이용해 파라미터를 갱신하는 알고리즘.
Adam은 1차/2차 모멘트를 사용해 학습을 안정화한다.

### Learning rate decay
학습이 진행될수록 learning rate를 점진적으로 줄이는 전략.
초기에는 빠르게, 후반에는 안정적으로 수렴시키기 위함이다.

### Inference
학습된 모델로 실제 출력을 생성하는 단계.
훈련과 달리 파라미터는 고정하고 forward 계산만 수행한다.

### Production vs Educational code
- Educational code: 원리 이해가 목적(단순/명료)
- Production code: 속도/메모리/안정성/운영성이 목적(복잡/최적화)

`microgpt.py`는 전자의 훌륭한 예시다.