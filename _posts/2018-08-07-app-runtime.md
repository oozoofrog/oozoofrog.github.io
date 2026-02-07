---
layout: post
title   : 런타임 앱
summary : 
date    : 2018-08-07 01:11:50 +0900
updated : 2018-08-07 23:17:35 +0900
tags    : 
toc     : true
public  : true
parent  : uselesses
parenttitle : 쓸모 없는 것들
latex   : false
---
* TOC
{:toc}

# repo

[https://github.com/NotCatLaunch/runtime](https://github.com/NotCatLaunch/runtime)

# 1. 기본적인 의도를 정의한다.

1. 앱을 실행하고, foreground로 프로세스가 올라오면, 실행 시간을 저장한다.
2. 실행 시간과 재실행 시간사이의 간격을 계산해 출력한다. 초단위로 하자. 츠음 실행한 경우에는 0이다. 즉 초기 데이터가 없다면 저장한 데이터와 이전 데이터를 동일하다고 판단한다.
3. 재실행하면, 기록된 데이터와 재실행 시점의 데이터를 계산하여 초로 출력하고 재실행 시점의 데이터를 이전 데이터에 덮어쓴다.

# 2. 개발환경
1. 데이터의 저장은 어떻게 할까?
    2. 어차피 내 맘대로 할 거니 CoreData를 쓰겠다.
2. 시간 데이터의 저장과 저장한 데이터의 습득은 ApplicationRepository를 만든다. 여기서는 AppDelegate자체를 AppModel로 사용한다.
3. ApplicationRepository는 CoreData를 통해 시간 데이터의 입출력을 수행한다.
4. 시간 데이터의 출력은 ViewModel를 통해 ApplicationRepository에 접근하여 데이터를 습득한다.
5. ViewModel과 ViewController간의 데이터교환은 RxSwift를 사용한다.
6. 중요한것! 테스트 케이스부터 작성한다.
