---
title   : iOS 취약점 정리
summary : 
date    : 2018-04-10 22:14:19 +0900
updated : 2018-04-10 22:14:19 +0900
tags    : security, iOS
---

[cve](https://www.cvedetails.com/product/15556/Apple-Iphone-Os.html?vendor_id=49 )

현재까지 보고된 iOS 취약점 리스트

# 2007
### code of execution or overflow

1. iOS에서 WebKit의 javascript 엔진의 perl compatible regular expressions(줄여서 PCRE) 라이브러리에서 다중 힙 기반 버퍼 오버플로우를 통해 원격으로 특정 javascript를 통해 임의의 코드를 실행할 수 있다.
	- iOS 1.0.1 미만
	- 유형: code execution, overflow
	- 다만, 힙 메모리는 동적으로 지정되기 때문에, 이런 방식의 공격자체는 효과적이지는 않다고 한다.

# 2008

1. 공격자가 HTML문서를 통해 임의로 전화를 걸 수 있다.
	- iPhone 1.0 ~ 2.1, iPod touch 1.1 ~ 2.1
2. safari에서 HTML TABLE element를 제대로 처리하지 못하여 조작된 HTML을 통해 임의의 코드 실행이나 서비스 거부(메모리 오염 및 어플리케이션 크래시)를 발생시킬 수 있다.
	- iPhone 1.0 ~ 2.1, iPod touch 1.1 ~ 2.1
	- 유형: DoS, code execution, memory corruption
3. iFrame의 컨텐츠가 iFrame의 영역을 넘을 수 있음을 이용, 조작된 HTML을 통해 사용자 인터페이스를 [스푸핑](https://ko.wikipedia.org/wiki/스푸핑)할 수 있다.
	- iPhone 2.0 ~ 2.1, iPod touch 2.1
4. 암호 잠금 기능은 긴급 통화 화면에서 SMS 메시지를 표시하기 때문에, 중요한 메시지의 정보가 타인에게 노출될 수 있습니다.
	- iOS 1.0 ~ 2.1, iPod touch 1.1 ~ 2.1
	- 유형: Gain Information
5. Race condition in the Passcode Lock feature in Apple iPhone OS 2.0 through 2.1 and iPhone OS for iPod touch 2.0 through 2.1 allows physically proximate attackers to remove the lock and launch arbitrary applications by restoring the device from a backup.
