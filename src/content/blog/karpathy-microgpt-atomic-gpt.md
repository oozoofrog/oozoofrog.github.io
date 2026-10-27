---
title: Karpathy의 microgpt.py 읽기
summary: 원문 코드를 같이 보면서 GPT 학습/추론 핵심을 단계별로 따라가는 스터디 가이드
date: 2026-02-14 18:40:00 +0900
categories: [AI, LLM, Python]
tags: [karpathy, microgpt, gpt, transformer, autograd, adam]
---

Karpathy의 `microgpt.py`를 코드와 같이 보면서 정리한 노트.

- 원문: [https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95)

> **읽기 노트 · 2026-10-28 보완:** 코드 블록은 원문을 읽기 위한 발췌이며, `...`를 포함하는 블록과 Swift 골격은 독립 실행 가능한 완성본이 아니다. 아래 보완은 [확인한 원문 revision `14fb038`](https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95/14fb038816c7aae0bb9342c2dbf1a51dd134a5ff)의 학습 흐름을 기준으로 한다. 원래 작성 시점의 revision을 소급해 단정하지 않는다.

이 글의 목적은 요약이 아니라, **코드를 실제로 따라 읽는 순서**를 만드는 것이다.

---

## 0) 읽는 방법 (추천)

아래 순서로 보면 이해가 가장 빠르다.

1. 이 글의 섹션 제목을 먼저 훑는다.
2. 각 섹션에서 제시한 코드 블록을 원문에서 찾는다.
3. “무엇을 계산하는지”만 먼저 이해한다.
4. 마지막에 용어 해설집으로 모르는 단어를 정리한다.

---

## 1) 데이터 준비 + 토크나이저

먼저 데이터셋을 만들고, 문자 단위 vocab을 구성한다.

```python
if not os.path.exists('input.txt'):
    import urllib.request
    names_url = 'https://raw.githubusercontent.com/karpathy/makemore/refs/heads/master/names.txt'
    urllib.request.urlretrieve(names_url, 'input.txt')
docs = [l.strip() for l in open('input.txt').read().strip().split('\n') if l.strip()]

uchars = sorted(set(''.join(docs)))
BOS = len(uchars)
vocab_size = len(uchars) + 1
```

핵심:

- 토크나이저는 BPE가 아니라 **문자 단위**
- `BOS` 특수 토큰을 추가해서 시퀀스 경계를 표현
- 원리 학습용이라 단순한 구성

---

## 2) 자동미분 엔진 (`Value`)

이 파일에서 가장 중요한 부분.
스칼라 기반 계산 그래프 + 역전파를 직접 구현한다.

```python
class Value:
    __slots__ = ('data', 'grad', '_children', '_local_grads')

    def __init__(self, data, children=(), local_grads=()):
        self.data = data
        self.grad = 0
        self._children = children
        self._local_grads = local_grads

    def __add__(self, other): ...
    def __mul__(self, other): ...
    def log(self): ...
    def exp(self): ...

    def backward(self):
        # topo 정렬 후 reverse 순회로 gradient 전파
        ...
```

핵심:

- 연산 시 local gradient를 저장
- `backward()`에서 체인룰 적용
- 프레임워크 내부 동작을 직접 볼 수 있음

---

### 손으로 확인할 작은 그래프

`a = 2`, `b = 3`, `c = 4`, `y = a * b + c`이면 `y = 10`이다. 역전파의 기대값은 `dy/da = 3`, `dy/db = 2`, `dy/dc = 1`이다. 원문의 완전한 `Value` 구현 뒤에 아래 검사를 붙여 큰 모델 전에 체인룰을 확인할 수 있다.

```python
a, b, c = Value(2), Value(3), Value(4)
y = a * b + c
y.backward()
assert (y.data, a.grad, b.grad, c.grad) == (10, 3, 2, 1)
```

이것은 검사용 기대값이며, 이 글에서 학습 실험을 새로 실행한 결과는 아니다.

## 3) 파라미터 초기화

작은 GPT를 만들기 위한 행렬들을 정의한다.

```python
n_embd = 16
n_head = 4
n_layer = 1
block_size = 16
head_dim = n_embd // n_head

matrix = lambda nout, nin, std=0.08: [[Value(random.gauss(0, std)) for _ in range(nin)] for _ in range(nout)]
state_dict = {
    'wte': matrix(vocab_size, n_embd),
    'wpe': matrix(block_size, n_embd),
    'lm_head': matrix(vocab_size, n_embd),
}
```

핵심:

- `wte`: token embedding
- `wpe`: position embedding
- 레이어별 `q/k/v`, `wo`, `mlp` 가중치 추가
- 전체 파라미터를 1차원 리스트로 flatten

이 설정에서 임베딩 벡터 길이는 16, head별 길이는 `16 / 4 = 4`다. `wte`는 `vocab_size × 16`, `wpe`는 `16 × 16`, `lm_head`는 `vocab_size × 16`이며 `linear(x, w)`는 `w`의 행 수만큼 값을 반환한다. `n_embd`를 바꿀 때는 `n_head`로 나누어떨어지는지도 확인한다.

---

## 4) 유틸 함수 (linear, softmax, rmsnorm)

Transformer 계산에 필요한 최소 함수들.

```python
def linear(x, w):
    return [sum(wi * xi for wi, xi in zip(wo, x)) for wo in w]

def softmax(logits):
    max_val = max(val.data for val in logits)
    exps = [(val - max_val).exp() for val in logits]
    total = sum(exps)
    return [e / total for e in exps]

def rmsnorm(x):
    ms = sum(xi * xi for xi in x) / len(x)
    scale = (ms + 1e-5) ** -0.5
    return [xi * scale for xi in x]
```

핵심:

- 수치 안정성을 위한 `max` 보정 softmax
- LayerNorm 대신 RMSNorm 사용

---

## 5) `gpt()` — 모델 본체

토큰 하나를 받아 다음 토큰 logits를 만드는 함수.

```python
def gpt(token_id, pos_id, keys, values):
    tok_emb = state_dict['wte'][token_id]
    pos_emb = state_dict['wpe'][pos_id]
    x = [t + p for t, p in zip(tok_emb, pos_emb)]
    x = rmsnorm(x)

    for li in range(n_layer):
        # attention block
        ...
        # mlp block
        ...

    logits = linear(x, state_dict['lm_head'])
    return logits
```

핵심:

- 입력: `(token_id, position)`
- 내부: attention + MLP + residual
- 출력: vocab 크기의 logits

---

## 6) Attention 블록만 따로 보기

이 부분이 가장 자주 막히는 구간이라 분리해서 보면 좋다.

```python
q = linear(x, state_dict[f'layer{li}.attn_wq'])
k = linear(x, state_dict[f'layer{li}.attn_wk'])
v = linear(x, state_dict[f'layer{li}.attn_wv'])
keys[li].append(k)
values[li].append(v)

attn_logits = [sum(q_h[j] * k_h[t][j] for j in range(head_dim)) / head_dim**0.5 for t in range(len(k_h))]
attn_weights = softmax(attn_logits)
head_out = [sum(attn_weights[t] * v_h[t][j] for t in range(len(v_h))) for j in range(head_dim)]
```

`q_h`, `k_h`, `v_h`는 위 블록에서 생략된 head별 분할 결과다. 원문은 `for h in range(n_head)` 안에서 `hs = h * head_dim`을 구하고, `q[hs:hs + head_dim]` 및 각 시점의 `k`, `v`에서 같은 구간을 잘라낸다. 이 설정에서는 각 head의 벡터 길이가 4이고, `k_h`·`v_h`의 바깥 축은 누적된 시점이다. 각 head 출력 4개를 이어 붙여 다시 길이 16으로 만든다.

체크포인트:

- `keys/values` 누적 = 과거 문맥 기억
- `q·k/sqrt(d)` → softmax → `v` 가중합
- head별 계산 후 concat

---

## 7) 학습 루프

문서 하나를 시퀀스로 돌면서 loss를 만들고 업데이트한다.

```python
doc = docs[step % len(docs)]
tokens = [BOS] + [uchars.index(ch) for ch in doc] + [BOS]
n = min(block_size, len(tokens) - 1)
keys, values = [[] for _ in range(n_layer)], [[] for _ in range(n_layer)]

losses = []
for pos_id in range(n):
    token_id, target_id = tokens[pos_id], tokens[pos_id + 1]
    logits = gpt(token_id, pos_id, keys, values)
    probs = softmax(logits)
    loss_t = -probs[target_id].log()
    losses.append(loss_t)
loss = (1 / n) * sum(losses)

loss.backward()
```

핵심:

- `n`은 이번 문서에서 학습할 다음 토큰 쌍의 수다. 마지막 토큰 뒤에는 정답이 없으므로 `len(tokens) - 1`을 사용하고, 위치 임베딩 범위를 넘지 않도록 `block_size`로 제한한다.
- `keys/values`는 **문서마다 새로 만든다**. 서로 다른 이름의 문맥과 계산 그래프가 섞이지 않게 한다.
- 목표: 다음 토큰 확률 최대화
- loss: 평균 NLL (cross-entropy 형태)
- 역전파로 모든 파라미터 gradient 계산

---

## 8) Adam 업데이트

```python
m[i] = beta1 * m[i] + (1 - beta1) * p.grad
v[i] = beta2 * v[i] + (1 - beta2) * p.grad ** 2
m_hat = m[i] / (1 - beta1 ** (step + 1))
v_hat = v[i] / (1 - beta2 ** (step + 1))
p.data -= lr_t * m_hat / (v_hat ** 0.5 + eps_adam)
p.grad = 0
```

핵심:

- 1차/2차 모멘트 사용
- 편향 보정(`m_hat`, `v_hat`)
- 학습률 선형 감소(`lr_t`)
- 위 블록은 `for i, p in enumerate(params):` 안에서 실행한다. 업데이트 뒤 `p.grad = 0`으로 초기화하지 않으면 다음 문서의 기울기에 이전 값이 더해진다. Adam의 `m`과 `v`는 학습 이력을 유지하므로 여기서 초기화하지 않는다.

---

## 9) 추론 루프

학습이 끝나면 `BOS`에서 시작해 토큰을 하나씩 샘플링한다.

```python
# 새 샘플을 시작할 때마다 문맥을 비운다.
keys, values = [[] for _ in range(n_layer)], [[] for _ in range(n_layer)]
token_id = BOS
for pos_id in range(block_size):
    logits = gpt(token_id, pos_id, keys, values)
    probs = softmax([l / temperature for l in logits])
    token_id = random.choices(range(vocab_size), weights=[p.data for p in probs])[0]
    if token_id == BOS:
        break
```

핵심:

- 위 블록도 전체 샘플 출력 코드의 발췌다. 생성 토큰을 문자열로 모으는 부분은 원문을 참고한다.
- temperature는 양수로 두고 다양성을 조절
- `BOS`가 나오면 샘플 종료

---

## 10) 이 코드를 볼 때 중요한 포인트

1. 이 코드는 **원리용 코드**다. (속도 목적 아님)
2. 실전과 차이는 대부분 **벡터화/배치/최적화** 영역이다.
3. 알고리즘 흐름 자체는 현대 LLM과 동일한 골격이다.

---

## 같이 공부할 때 추천 미션

### 미션 A
`n_embd`, `n_head`, `n_layer`를 바꿔보고 loss 곡선 변화를 비교.

### 미션 B
`temperature`를 `0.2 / 0.5 / 1.0`으로 바꿔 샘플 품질 비교.

### 미션 C
`relu`를 `gelu`(직접 구현)로 바꿔 결과 비교.

### 미션 D
문자셋 대신 다른 작은 데이터셋으로 바꿔보기.

---

## Python 코드를 Swift로 옮기려면

완전 동일 구현(교육용)을 목표로 하면 아래 순서가 가장 안전하다.

## 1) 구현 전략 먼저 고르기

### 전략 A: 스칼라 오토그라드 그대로 이식 (학습용)
- `Value` 클래스를 Swift `final class`로 구현
- 연산자 오버로딩(`+`, `*`, `/`, prefix `-`) 적용
- `backward()` 토폴로지 순회 구현
- 장점: 원문 구조와 1:1 대응, 공부에 좋음
- 단점: 매우 느림

### 전략 B: Swift Numerics/Accelerate 기반 벡터화 (실용용)
- `Float`/`Double` 배열 기반 연산
- 행렬 연산은 Accelerate(BLAS/vDSP) 사용
- 장점: 속도 개선
- 단점: 원문과 구조 차이가 커져 학습용 비교가 어려움

처음엔 **전략 A**로 옮긴 뒤, 다음 단계에서 B로 넘어가는 걸 추천.

## 2) 핵심 타입 대응표

- Python `Value` → Swift `final class Value`
- `list[Value]` → `[Value]`
- `list[list[Value]]` → `[[Value]]`
- `dict[str, matrix]` → `[String: [[Value]]]`
- lambda 초기화 → `func matrix(_ nout:Int, _ nin:Int, std:Double) -> [[Value]]`

## 3) `Value` 최소 골격 (Swift)

```swift
final class Value: Hashable {
    var data: Double
    var grad: Double = 0
    var children: [Value]
    var localGrads: [Double]

    init(_ data: Double, children: [Value] = [], localGrads: [Double] = []) {
        self.data = data
        self.children = children
        self.localGrads = localGrads
    }

    static func == (lhs: Value, rhs: Value) -> Bool { lhs === rhs }
    func hash(into hasher: inout Hasher) { hasher.combine(ObjectIdentifier(self)) }
}
```

포인트:
- 역전파 토폴로지 정렬을 위해 **참조 동일성(===)** 기반 Hashable이 필요.

## 4) 연산자 오버로딩

Swift에서 Python처럼 쓰려면 연산자 오버로딩을 미리 만들어야 한다.

```swift
func + (lhs: Value, rhs: Value) -> Value {
    Value(lhs.data + rhs.data, children: [lhs, rhs], localGrads: [1, 1])
}

func * (lhs: Value, rhs: Value) -> Value {
    Value(lhs.data * rhs.data, children: [lhs, rhs], localGrads: [rhs.data, lhs.data])
}
```

추가로 구현할 것:
- `pow`, `log`, `exp`, `relu`
- `-`, `/`, `radd/rmul`에 해당하는 편의 오버로드

## 5) 역전파 구현 포인트

원문 로직 그대로 구현하면 된다.

1. DFS로 topo 정렬
2. loss.grad = 1 세팅
3. reverse topo 순회하며 child.grad 누적

주의:
- Swift는 재귀 깊이/성능 이슈가 있을 수 있으니, 필요하면 iterative DFS로 변경.

## 6) 모델/학습 루프 이식 순서

한 번에 다 옮기지 말고 아래 순서로 테스트하며 진행.

1. `Value` 단위 테스트 (`(a*b + c).backward()`)
2. `linear`, `softmax`, `rmsnorm` 이식
3. `gpt()` forward만 먼저 성공
4. loss 계산 + backward 연결
5. Adam 업데이트 연결
6. 추론 샘플링

## 7) Swift 이식 시 자주 걸리는 지점

- 참조 타입/값 타입 혼동 (`class` vs `struct`)
- `Value` 객체 공유로 인한 gradient 누적 중복 버그
- `exp/log`에서 수치 불안정
- 랜덤 시드 재현성 차이(Python과 bit-level 불일치)
- 느린 중첩 루프 성능

## 8) 현실적인 목표

- 1단계: Python과 **같은 개념 동작** 확인
- 2단계: 작은 데이터셋에서 loss 감소 확인
- 3단계: Swift 벡터화/가속으로 리팩터링

즉, 처음부터 빠른 코드를 만들기보다,
**정확히 같은 알고리즘을 옮기는 것**을 우선으로 두는 편이 좋다.

---

## 용어 해설집

### Next-token prediction
현재까지의 토큰을 보고 다음 토큰의 확률 분포를 예측하는 학습 목표.

### Token / Vocabulary
토큰은 모델의 최소 단위, vocab은 가능한 전체 토큰 집합.

### BOS
시퀀스 경계를 표시하는 특수 토큰. 이 구현은 같은 `BOS` 토큰을 문서 앞뒤에 놓고, 생성 중 다시 나오면 종료한다.

### Logits / Softmax
logits는 확률화 전 점수, softmax는 이를 확률 분포로 변환.

### Temperature
샘플링 분포의 sharpness를 조절하는 값.

### Attention / QKV
문맥에서 중요한 위치를 가중합으로 읽어오는 메커니즘.

### Residual
입력을 출력에 더해 정보 손실을 줄이고 학습 안정성을 높임.

### RMSNorm
벡터 크기 기반 정규화 방식.

### Loss (NLL)
정답 토큰 확률이 낮을수록 커지는 손실 값.

### Backpropagation
손실로부터 각 파라미터의 gradient를 계산하는 과정.

### Adam
gradient의 1차/2차 모멘트를 이용해 파라미터를 갱신하는 optimizer.

---

짧게 정리하면,
`microgpt.py`는 “GPT가 어떻게 학습되고 생성되는가”를 숨김없이 보여주는 파일이다.

큰 프레임워크로 넘어가기 전에 한 번은 꼭 직접 따라가 볼 만하다.