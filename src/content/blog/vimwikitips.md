---
title: Vim 그리고 위키 팁스
date    : 2018-04-09 00:00:00 +0900
updated: 2018-04-10 09:12:07 +0900
parent: developing
---

> **2026-10-28 검토:** 2018년의 Vim 단축키 메모입니다. 기본 기능과 추가 플러그인이 필요한 명령을 나누었습니다.



### 설정
- expandtab 설정은 tab키를 사용할 경우 space로 바꾼다. noexpandtab 설정은 tab을 tab으로 사용한다.

### 이동
- w, b: 단어 단위 이동
- 입력 모드에서 `Ctrl-O`를 누르면 일반 모드 명령 **하나**를 실행한 뒤 입력 모드로 돌아온다. 일반 모드에 계속 머무르는 전환은 아니다. [Vim 도움말](https://vimhelp.org/insert.txt.html#i_CTRL-O)

### 변환
- ~ 키를 대문자나 소문자 알파벳 상에 커서를 두고 누르면, 대소문자를 변환한다.

### 단어를 괄호로 감싸기 (vim-surround)

Vim 기본 명령이 아니라 [vim-surround](https://github.com/tpope/vim-surround)가 설치되어 있어야 한다.

- 단어 위에서 `ysiw]`: 단어를 `[word]`처럼 감싼다.
- `ys`는 감싸기 동작, `iw`는 현재 단어라는 텍스트 객체, `]`는 감쌀 문자다.
- 여는 괄호와 닫는 괄호는 공백 처리에 차이가 있으므로 플러그인 도움말을 함께 확인한다.
