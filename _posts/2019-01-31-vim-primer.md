---
layout: post
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
* TOC
{:toc}

# Functions, Types, Variables

## 함수(Function)

```vimscript
function! Echo()
    echo '안녕'
endfunction
```
- 함수명은 내장 함수와 구별하기 위해 대문자로 시작해야한다.
- 시작은 function, 끝은 endfunction
- 함수는 파일로 저장하고 `source 파일명` 명령어로 해당 파일을 읽어들여 로딩한다.
- 명령어 입력(:)에서 `call Echo()`으로 실행 할 수 있다.
- function 뒤에 `!`는 이름이 같은 기존 함수를 덮어쓸 수 있다.

### 인수(Arguments)
```
function EchoQuote(quote)
    echo a:quote
endfunction
```
- 인수를 사용할 수 있다. 사용할 때는 a(rgument)를 붙여서 사용한다. argument:quote의 형식으로도 사용가능하다.

