---
title   : Vim Primer
summary : 빔 플러그인 만들기
date    : 2019-01-31 11:53:11 +0900
updated : 2019-02-03 21:48:35 +0900
tags    : 
toc     : true
public  : true
parent  : vim
parenttitle : 빔 공부
latex   : false
---

> **2026-10-28 검토:** legacy Vimscript 문법을 다루는 2019년 학습 메모입니다. Vim9 script 문법과는 구별해서 읽어주세요.


# Functions, Types, Variables

## 함수(Function)

```vimscript
function! Echo()
    echo '안녕'
endfunction
```
- 함수명은 내장 함수와 구별하기 위해 대문자로 시작하는 전역 사용자 함수 이름을 쓴다. 스크립트 로컬 함수 등에는 별도 규칙이 있다.
- 시작은 function, 끝은 endfunction
- 함수는 파일로 저장하고 `source 파일명` 명령어로 해당 파일을 읽어들여 로딩한다.
- 명령어 입력(:)에서 `call Echo()`으로 실행 할 수 있다.
- function 뒤에 `!`는 이름이 같은 기존 함수를 덮어쓸 수 있다.

### 인수(Arguments)
```vimscript
function! EchoQuote(quote)
    echo a:quote
endfunction
```
- 함수 인수에는 `a:` 접두사를 붙인다. `quote` 인수는 `a:quote`로 참조하며, `argument:quote`는 유효한 별칭이 아니다.


```vimscript
call EchoQuote("한 줄 인용")
" 예상 출력: 한 줄 인용
```

위 정의를 파일로 저장한 뒤 `:source 파일명`으로 불러오고 호출한다. 자세한 범위 규칙은 [Vim의 variable-scope 도움말](https://vimhelp.org/eval.txt.html#variable-scope)을 참고한다.
