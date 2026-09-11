---
title: "Astra·Luna 코딩 실험: 계획 분리와 추론 강도"
summary: "QuixBugs 6문제, 156조합으로 비교한 계획·구현 분리와 단일 세션 구현의 성공률, 토큰, 실행시간."
date: 2026-09-12 00:00:00 +0900
categories: [AI, LLM, Python]
tags: [codex, astra, luna, benchmark, quixbugs]
---

QuixBugs의 단일 함수 버그 6개를 Astra와 Luna로 수정했다. 계획과 구현을 다른 세션에 맡기는 방식, 한 세션에서 바로 구현하는 방식, Astra의 추론 강도를 비교했다.

유효한 155조합은 모두 테스트를 통과했다. 같은 성공률에서 보고 토큰과 실행시간이 가장 적었던 구성은 **Astra low의 단일 세션 구현**이었다. 별도 계획이나 높은 추론 강도에 따른 추가 성공은 관측되지 않았다.

## 가설

1. Astra가 계획하고 Luna가 구현하면, 역순보다 같은 성공률에서 토큰과 시간을 덜 사용한다.
2. 계획 세션을 분리하면 직접 구현보다 성공률이 높아지거나 전체 자원 소모가 줄어든다.
3. Astra의 추론 강도를 높이면 수정 성공률이 올라간다.

## 실험 환경과 구성

실행 기간은 2026년 9월 11∼12일이다. macOS arm64에서 Codex CLI `0.153.4`와 Python `3.14.7` 하네스를 사용했다. 속도 설정은 Standard, 자동 재시도는 없었다.

- **Astra**: `gpt-6-astra`. `low`, `medium`, `high`, `xhigh`, `max`, `ultra`를 각각 실행했다.
- **Luna**: `gpt-5.6-luna`. 계획과 구현 모두 `max`로 고정했다.

두 글자 조건은 앞이 계획자, 뒤가 구현자다. **AL**은 Astra 계획·Luna 구현, **LA**는 Luna 계획·Astra 구현이다. **AA**와 **LL**은 같은 모델을 두 역할에 사용한다. AA의 계획자와 구현자는 같은 추론 강도로 실행했다.

**A**와 **L**은 별도 계획자 없이 한 세션에서 분석·수정·공개 검증을 마친다. 세션 도중 모델이나 추론 강도를 바꾸지 않는다.

계획자는 파일을 수정하지 않고 최소 수정 계획을 제출했다. 구현자에게는 해당 계획자의 최종 응답만 전달했으며, 잘못된 계획은 고칠 수 있도록 했다. 모든 단계는 새 프로세스·작업 폴더·`CODEX_HOME`에서 시작했다. 메모리와 스킬, 웹 검색, 다른 에이전트 호출을 비활성화하고 작업 폴더의 접근 권한을 제한했다.

세션당 시간 한도는 180초다. 두 세션 조건의 최대 합계는 360초, 단일 세션은 180초이므로 동일한 총 예산 비교는 아니다.

## 대상과 판정

[QuixBugs](https://github.com/jkoppel/QuixBugs/tree/4257f44b0ff1181dedaedee6a447e133219fcebf)의 다음 Python 함수를 사용했다. 원본은 커밋 `4257f44`로 고정했다.

- `bitcount`: 정수의 1비트 수
- `find_first_in_sorted`: 정렬된 배열에서 첫 일치 위치
- `quicksort`: 퀵 정렬
- `next_palindrome`: 다음 회문 수
- `rpn_eval`: 역폴란드 표기식 계산
- `gcd`: 최대공약수

조건별로 각 문제를 한 번씩 실행했다. Astra가 포함된 AL·LA·AA·A는 각각 36조합, Luna만 사용하는 LL·L은 각각 6조합이다. LL·L을 Astra 강도별로 반복하지 않았다. 총 156조합, 최대 270세션이다.

공개 사례 18개와 모델에 제공하지 않은 추가 사례 424개를 사용했다. 기대값은 별도 생성기로 만들었으며, QuixBugs의 전체 표준 테스트 점수는 아니다. 모든 제출을 고정한 뒤 추가 사례를 평가했다. **공개·추가 테스트 통과와 실행 규칙 준수를 모두 만족해야 PASS**로 판정했다.

캐시 입력과 추론 출력은 이미 각각 입력·출력에 포함되므로 다시 더하지 않았다. 시간은 CLI 프로세스 시작부터 종료까지 측정했다. 두 세션 조건은 계획과 구현 구간을 합산하고 사전 점검 시간은 제외했다.

## 역할 구성에 따른 차이

AL의 `xhigh / quicksort` 한 건은 계획 세션이 약 4.48초 만에 중단되어 구현을 건너뛰었다. 완료 이벤트와 사용량이 없어 INVALID로 처리했다. 오답으로 집계하지 않았다. 나머지 155조합은 모두 PASS였다.

<figure class="routing-figure">
  <div class="routing-plots">
    <img src="/assets/images/posts/codex-routing/configurations-tokens.svg" alt="Astra low·Luna max에서 문제당 평균 보고 토큰. A 47.8천, L 51.8천, AA 96.9천, AL 106.9천, LA 95.2천, LL 90.5천." width="480" height="360" loading="lazy" />
    <img src="/assets/images/posts/codex-routing/configurations-seconds.svg" alt="같은 조건의 문제당 평균 실행시간. A 28.6초, L 48.2초, AA 68.1초, AL 87.6초, LA 105.8초, LL 104.2초." width="480" height="360" loading="lazy" />
  </div>
  <figcaption>Astra는 low, Luna는 max. 각 막대는 동일한 6문제의 평균이며 모두 6/6 PASS다. 시간은 도구 실행을 포함하고, 두 실험의 실행 구간은 겹쳤다.</figcaption>
</figure>

A low는 L max보다 합산 토큰이 7.7%, 실행시간이 40.7% 적었다. 시간은 6문제 모두 짧았지만 토큰은 세 문제씩 나뉘었다. 토큰 차이를 모든 문제에 공통인 우위로 보기는 어렵다.

### 계획 단계의 추가 비용

모든 Astra 강도에서 같은 문제끼리 대응시키면, 단일 A는 AA보다 토큰을 44.6%, 시간을 56.2% 덜 사용했다. 36쌍 모두 같은 방향이었다. 단일 L도 LL에 비해 토큰 42.7%, 시간 53.8%가 줄었고, 6쌍 모두 통과했다.

<figure class="routing-figure">
  <div class="routing-plots">
    <img src="/assets/images/posts/codex-routing/planning-tokens.svg" alt="계획과 구현의 평균 토큰. A 구현 59.2천. AA 계획 51.0천과 구현 56.0천. L 구현 51.8천. LL 계획 44.0천과 구현 46.5천." width="480" height="360" loading="lazy" />
    <img src="/assets/images/posts/codex-routing/planning-seconds.svg" alt="계획과 구현의 평균 시간. A 구현 37.3초. AA 계획 45.9초와 구현 39.2초. L 구현 48.2초. LL 계획 63.4초와 구현 40.9초." width="480" height="360" loading="lazy" />
  </div>
  <figcaption>A·AA는 Astra 6강도 전체의 36조합 평균, L·LL은 각각 6조합 평균이다. 계획 단계와 구현 단계를 누적했다.</figcaption>
</figure>

계획 전달 후 구현 단계의 토큰은 조금 줄었다. AA의 구현은 단일 A보다 평균 5.5%, LL의 구현은 단일 L보다 10.3% 적었다. 그러나 계획에 각각 평균 5.1만, 4.4만 토큰이 추가됐다. 구현 단계의 절약으로 별도 세션의 소모를 상쇄하지 못했다.

### AL과 LA

중단된 조합을 양쪽에서 제외한 35쌍에서 AL의 합산 실행시간은 LA보다 14.1% 적었다. 28쌍에서 AL이 빨랐다. 토큰 합계 차이는 2.5%였고, 문제별로는 AL이 적은 경우 18개, LA가 적은 경우 17개였다.

<figure class="routing-figure">
  <div class="routing-plots">
    <img src="/assets/images/posts/codex-routing/al-la-tokens.svg" alt="같은 문제·강도에서 LA 대비 AL의 토큰 절감률. low에서는 AL의 토큰이 더 많았고 나머지 강도에서는 더 적었다." width="480" height="360" loading="lazy" />
    <img src="/assets/images/posts/codex-routing/al-la-seconds.svg" alt="같은 문제·강도에서 LA 대비 AL의 실행시간 절감률. 모든 강도의 합산 시간에서 AL이 짧았다." width="480" height="360" loading="lazy" />
  </div>
  <figcaption>양수는 AL의 사용량·시간이 적다는 뜻이다. 강도별로 같은 문제의 합계를 비교했다. xhigh는 5쌍, 나머지는 6쌍이다.</figcaption>
</figure>

AL에서는 시간상의 이점이 관측됐다. 품질 차이는 없었고, 토큰 우위도 일관되지는 않았다.

## 추론 강도

단일 A는 low부터 ultra까지 모두 6/6을 통과했다.

<figure class="routing-figure">
  <div class="routing-plots">
    <img src="/assets/images/posts/codex-routing/effort-tokens.svg" alt="Astra 단일 세션의 평균 토큰. low 47.8천, medium 53.9천, high 63.2천, xhigh 58.8천, max 71.0천, ultra 60.5천." width="480" height="360" loading="lazy" />
    <img src="/assets/images/posts/codex-routing/effort-seconds.svg" alt="Astra 단일 세션의 평균 시간. low 28.6초, medium 33.5초, high 33.1초, xhigh 39.0초, max 50.4초, ultra 39.3초." width="480" height="360" loading="lazy" />
  </div>
  <figcaption>강도별 동일한 6문제의 평균. 성공률은 모두 같았다.</figcaption>
</figure>

max는 low보다 토큰을 48.5%, 시간을 76.2% 더 사용했지만 추가로 통과한 문제는 없었다. 토큰과 시간은 강도 순서대로 증가하지 않았으며, max가 ultra보다 큰 값을 기록했다. 조건별 실행이 한 번뿐이라 변동의 원인은 분리할 수 없다.

## 최종 성공률에 가려진 계획 오류

구현자가 계획을 보완했다고 보고한 사례는 네 건이었다. 모두 Luna의 계획이었고, 실제 계획서와 수정 코드에서도 누락이나 오류를 확인했다.

`LA / low / bitcount`의 계획은 코드가 올바르므로 수정하지 말라는 내용이었다. 원본의 다음 갱신은 `n = 1`에서도 값을 1로 남겨 루프를 끝내지 못한다.

```python
n ^= n - 1
```

Astra 구현자는 XOR를 AND로 바꿨다.

```python
n &= n - 1
```

나머지 세 건은 `find_first_in_sorted`였다. LA medium·LA high·LL의 계획은 상한 초기값만 줄이도록 했지만, 그 변경만으로는 부재 값을 검색할 때 무한 반복이 남았다. 구현자가 상한 갱신까지 보완해 통과했다.

최종 PASS는 계획과 구현을 합친 결과다. 구현자가 잘못된 계획을 고칠 수 있는 조건에서는 계획자의 오류가 최종 성공률에 드러나지 않을 수 있다. 보완 보고가 없던 나머지 계획의 정확성을 독립적으로 판정한 것은 아니다.

## 해석 범위

서로 다른 문제는 6개다. 155개 통과 결과가 155개의 독립적인 새 문제에서 나온 것은 아니다. 통과한 패치 중 147개는 한 줄 교체였고 나머지도 한두 줄 수준이었다. 공개 문제라 학습 데이터에 포함됐을 가능성도 있다.

추가 실험의 실행 구간인 22:37∼00:08은 기존 실험의 22:13∼00:11과 겹쳤다. 계정·서버·호스트의 동시 작업 영향을 통제하지 못했다. Python 시작 과정의 `xcrun` 캐시 권한 경고도 238세션에서 관측됐다. 측정 시간에는 이런 도구 실행이 포함된다.

완료한 세션의 입력 토큰 중 79.7%는 캐시 입력이었다. 보고 토큰의 감소율을 청구 금액이나 구독 크레딧 감소율로 바꿀 수는 없다. 모델과 추론 강도는 로컬 호출 설정으로 확인했으며 백엔드 신원을 별도로 검증하지 않았다.

단순한 단일 함수 수정에서는 A low를 기본 후보로 둘 근거가 생겼다. 여러 파일의 의존성, 긴 디버깅 과정, 새 요구사항의 설계까지 적용할 근거는 부족하다. 그런 작업에서 계획 분리의 가치와 추론 강도의 차이를 가리려면 더 어려운 새 과제와 반복 실행이 필요하다.

## 데이터

- [156조합 측정값(JSON)](/assets/data/codex-routing-2026-09-12.json)
- [그래프 생성 코드](https://github.com/oozoofrog/oozoofrog.github.io/blob/main/scripts/plot-codex-routing.py)
- [QuixBugs 원본](https://github.com/jkoppel/QuixBugs/tree/4257f44b0ff1181dedaedee6a447e133219fcebf)

<style>
  .routing-figure { margin: 1.5rem 0; }
  .routing-plots {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 1rem;
  }
  .post-content .routing-plots img {
    display: block;
    width: 100%;
    height: auto;
    margin: 0;
    border-radius: 0;
  }
  .routing-figure figcaption {
    margin-top: .75rem;
    font-size: .9rem;
    line-height: 1.7;
    color: #56675e;
  }
</style>
