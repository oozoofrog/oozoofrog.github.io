---
layout  : wiki
title   : VIM 공부
summary : 
date    : 2018-04-08 23:00:56 +0900
updated : 2018-04-10 22:17:51 +0900
tags    : 
toc     : true
public  : true
parent  : developing
latex   : false
---
* TOC
{:toc}

# 텍스트 다루기

- maxOS 사용시 비쥬얼 모드에서 선택한 텍스트를 paste board에 넣으려면, 선택상태에서 `w !pbcopy` 명령어를 입력하면 된다.
	- 실제로는 이렇게 표시될 것이다. `'<,'>w !pbcopy`

# neovim

- nvim을 사용하기로 했는데, 초반에 바보 같은 실수로 몇 십분 고생했다.
- junegunn님의 [vim-plug](https://github.com/junegunn/vim-plug.git)를 사용중인데, nvim 플러그인 파일의 위치가 다르다는 것을 생각하지 못하고, vim설정들을 그냥 옮겼더니 계속 문제가 발생했었다. 걍 vim-plugin README에 neovim 설치방법이 나와있었다.
- neovim에서 python3를 이용하기 위해서는(youcompleteme 플러그인의 python 에러 대응등을 위해) 아래와같이 실행해야한다.
`pip3 install --upgrade neovim`
