---
layout  : post
title   : ABI 안정화 그리고 그 이상
summary : 스위프트 5.0부터 이루어진 ABI 안정화 그리고 좋아진 것들
date    : 2019-03-28 10:23:56 +0900
updated : 2019-03-28 23:50:51 +0900
categories : swift abi
---
* TOC
{:toc}

*원문 [ABI Stability and More](https://swift.org/blog/abi-stability-and-more/)*

macOS, iOS, watchOS, 그리고 tvOS에서 스위프트의 ABI를 안정화시키는 것은 오랜 목표였습니다. 안정적인 ABI는 모든 언어에서 중요하지만, 스위프트 생태계에서 그것이 주는 궁극적인 이점은 앱과 라이브러리들의 [바이너리(-코드) 호환성(Binary-code compatibility)](https://en.wikipedia.org/wiki/Binary-code_compatibility)을 가능하게 한다는 것입니다. 이 글에서는 스위프트 5에서 바이너리 호환성이 어떤 의미인지, 그리고 앞으로의 스위프트 배포에 어떤 혁신을 가져올지 기술합니다.

다른 플랫폼에서는요? 라는 질문을 하실 수 있을거 같네요. ABI 안정화는 스위프트를 컴파일하고 실행할 수 있는 모든 운영체제에 적용되었습니다. 애플 플랫폼 상에서 스위프트 5의ABI는 안정화 되었다고 공표되었습니다. Linux, Windows, 그 외의 성숙한 플랫폼의 개발자라면, 스위프트 Core Team이 안정화 작업을 진행중에 있습니다.

스위프트 5는 앱을 위한 바이너리 호환성을 제공합니다. 앞으로는 한 버전의 스위프트 컴파일러로 빌드한 앱이 다른 버전으로 빌드한 라이브러리와의 소통을 보장합니다. 이는 이전 버전(*-swift-version 4.2*)과의 호환 모드에서도 마찬가지입니다. 

![Image of abi stability](https://swift.org/assets/images/abi-stability-blog/abi-stability.png)

이 예제를 보면, 스위프트 5.0으로 빌드한 앱이 스위프트 5 표준 라이브리가 설치된 시스템에서 돌아가는 것과 마찬가지로 스위프트 5.1 혹은 스위프트 6으로 가정한 시스템에서도 잘 돌아가는 것을 보여줍니다.

*(이 글에서 스위프트 5.0 이상의 버전은 물론 모두 가정입니다.)*

Apple OS들에서의 ABI 안정화는 다음 업데이트되는 모든 OS에 더 이상 Swift standard library 와 **overlay** 라이브러리를 포함할 필요가 없어 앱의 다운로드 사이즈가 줄어든다는 뜻입니다. 스위프트 런타임은 Objective C 런타임과 마찬가지로 OS에 포함되게 됩니다.

이런 변화가 앱 스토어에 앱을 배포하는데 어떻게 영양을 미치는지는 [Xcode 10.2 release notes](https://developer.apple.com/documentation/xcode_release_notes/xcode_10_2_beta_release_notes/swift_5_release_notes_for_xcode_10_2_beta)에서 상세한 정보를 확인할 수 있습니다.

<br/>
## 모듈 안정화(Module Stability) 

ABI 안정화는 앱 실행시에 스위프트의 여러 버전을 사용할 수 있는 것에 대한 내용입니다. 컴파일 타임에는 어떨까요?
