---
title   : 애플 개발 문서 읽기
summary : 애플 개발 문서를 모두 읽어보
date    : 2019-03-20 23:16:43 +0900
updated : 2019-03-20 23:39:57 +0900
tags    : apple, ios, mac, documentation
toc     : true
public  : true
parent  : study.md
parenttitle : 공부, 그리고 공부
latex   : false
---

# About App Developement with UIKit
## 개요
UIKit framework 으로는 iOS, tvOS 개발이 가능하다. 콘텐트를 화면에 뿌리고 콘텐트와 상호작용하는데 사용할 수 있다.
`Xcode가 필요하다.`
Xcode에서는 템플릿 프로젝트로 앱 개발을 시작하게 된다.

## 필요한 자원
- App icons
- Launch screen storyboard

### 필요한 메타데이터
- Info.plist 파일은 앱의 설정과 가능성(카메라등 가능한 기능들)의 정보를 담고 있다.
    - 자세한 내용은 [Information Property List Key Reference](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Introduction/Introduction.html#//apple_ref/doc/uid/TP40009247)에서 찾아보자

## Code Structure of a UIKit App

- UIKit 앱은 MVC 디자인 패턴에 기반한다.
    - Model은 앱의 데이터와 비즈니스 로직을 담는다.
    - View는 데이터를 가시적으로 표현한다.
    - Controller는 View와 Model 사이에서 데이터의 흐름을 주선한다.

UIKit과 Foundation framework는 모델의 기본 타입을 제공하고, UIKit에서 제공하는 UIDocument는 디스크 기반의 데이터 구조를 구성할 수 있다. Foundation은 문자열, 숫자, 배열 등의 기타 데이터 타입을 제공한다.
UIKit는 UIView 클래스를 통해 사용자의 콘텐트를 표현하고, UIApplication 객체를 통해서는 앱의 메인 이벤트 루프와 라이프 사이클을 수행한다.
