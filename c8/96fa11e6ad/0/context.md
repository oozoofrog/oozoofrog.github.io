# Session Context

## User Prompts

### Prompt 1

Implement the following plan:

# AdSense 심사 대비: 쿠키 동의 배너 구현

## Context

AdSense 심사 검토 결과, 빈약한 콘텐츠 8개는 이미 `public: false`로 비공개 상태여서 문제없음.
**가장 시급한 이슈는 쿠키 동의 배너 미구현**으로, GA4와 AdSense 스크립트가 동의 없이 로드되어 GDPR 위반 및 AdSense 정책 위반 위험이 있음.

Google Consent Mode v2를 적용하여 스크립트는 그대로 로드하되, 동의 상태에 따라 데이터 수집을 제어하는 방식으로 구현.

## 브랜치

`feat/cookie-consent` 브랜치 생성 후 작업

## 수정 파일 목록

| 순서 | 파일 | 작업 |
|------|------|------|
| 1 | `src/components/Analytics.astro` | Consent Mode v2 기본값(denied) 추가 |...

### Prompt 2

run local server and open local link

### Prompt 3

표시 잘되었음

### Prompt 4

commit and create pr

