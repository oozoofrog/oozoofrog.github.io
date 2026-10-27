---
date: 2016-07-10 14:44:24+00:00
title: Accelerate의 퍼포먼스
categories:
- Accelerate
- swift
---

> **2026-10-28 검토·정정:** Xcode 8 beta 2 당시 실험 기록입니다. 두 구현이 서로 다른 인덱스를 읽고 초기화 작업도 달랐던 오류를 수정했습니다. 아래 코드는 비교 조건을 맞춘 수정본이며, 남겨둔 시간은 수정 전의 역사적 기록입니다. 수정본의 성능 수치는 다시 측정하지 않았습니다.

# Accelerate vs for loop

accelerate framework는 simd를 이용한 병렬 처리 연산 함수 집합입니다. simd 모듈이 별도로 존재하지만, 선형대수에 대한 연산의 경우 accelerate쪽이 이미 함수들을 구현해놨으니 훨씬 편하겠죠.

가이드 문서를 보면, 스칼라, 벡터, 행렬연산부터 푸리에 변환을 이용한 신호 처리, 이미지 처리등의 기능을 가지고 있다고 나와있습니다. 벡터화에 적합한 연산에서 CPU의 SIMD를 활용할 수 있습니다. 다만 vDSP는 입력과 CPU에 따라 스칼라 구현을 사용할 수도 있으므로, 어떤 연산에서나 일반 연산자보다 빠르다고 단정할 수는 없습니다.

아주 심플한 OpenGL 매트릭스의 morphing에 써본 것을 시작으로 적극적으로 써보기 시작했는데, 가우시안 블러같은 경우 CoreImage를 이용한 처리보다 세밀하게 이미지를 다룰 수 있어 vDSP의 convolution 함수를 이용하고 있습니다. CoreImage로 블러 처리를 하시는 경우 convolution 계산으로 인한 edge pixel의 유실을 다른 분들은 어떻게 처리하시는지 궁금하네요. 좋은 팁이 있으시면 알려주시기 바랍니다. 그래도 CoreImage가 더 편하긴 하거든요.

## 구성

  * blas (basic linear algebra subprograms) - 기본적인 선형대수 함수집합

    * The Level 1 - 스칼라, 벡터, 그리고 벡터 대 벡터 연산

    * The Level 2 - 벡터 대 매트릭스 연산

    * The Level 3 - 매트릭스 대 매트릭스 연산

    * 오래전부터 발전해온 수학 연산 함수로 폭넓은 언어에서 사용이 가능합니다.

  * vDSP

    * 벡터와 매트릭스(행렬) 연산

    * 푸리에 변환

    * Convolution, correlation, and window generation.

    * Biquadratic filtering

  * vImage

    * 이미지 처리와 관련한 각좀 함수와 타입을 정의한 모듈입니다.

  * 기타등등

**가볍게 퍼포먼스 테스트를 해보겠습니다.**

  * 세밀한 이미지 처리를 하기 위해서 픽셀 하나가 8 bit unsigned integer (0 ~ 255)로 되어 있는 이미지를 float배열로 바꾸려고 합니다.

  * 이미지 픽셀이 그레이스케일 채널과 알파채널 총 2채널로 구성되어있다고 가정해보겠습니다. 한 픽셀은 16bit(2 byte)가 되겠고, 이미지처리를 위해서는 첫번째 바이트만 가져오면 됩니다.

  * 따라서 픽셀을 가져오는 순서는, 0, 2, 4, 6... 가 되겠군요. 단순히 테스트를 위해서 1, 3, 5, 7...의 경우도 상정합니다.

  * image size - 10 x 10 pixel

  * system - 2011 late mac book pro 13inch, iPhone Simulator

  * Xcode 8 beta 2

## vDSP

  * 먼저 vDSP의 uint8 -> float변환 함수에 stride를 2로 적용하여 float배열에도 복사하는 작업을 테스트당 10000번씩 실행도록 구성했습니다.

  * 복사할 때마다 시작 offset값이 0과 1사이에서 변경되도록 했습니다.

  * 수정본에서는 두 구현 모두 출력 배열을 미리 만들고 매번 모든 요소를 덮어씁니다. vDSP 쪽에만 있던 `vDSP_vfill` 초기화는 제거했습니다.

```swift
func testAccelerate() {
            // This is an example of a performance test case.
            let image = UIImage(named: "grayscaled_image_name")!.cgImage!
            let data = image.dataProvider!.data! as NSData
            let size = CFDataGetLength(data)

            self.measure {
                let bytes = data.bytes
                var floats = [Float].init(repeating: 0, count: size/2)
                for i in 0..<10000 {
                    vDSP_vfltu8(UnsafePointer<UInt8>(bytes).advanced(by: i % 2), 2, &floats, 1, vDSP_Length(size/2))

                }
            }

        }
```

_수정 전 기록: avg 0.009~0.010sec, 표준편차 14 ~ 30%. 위 수정본의 결과가 아닙니다._

## for loop

  * 이미지 데이터 사이즈의 반이 되도록 float배열을 생성합니다.

  * float배열의 수만큼 for loop를 반복하며 짝수 인덱스의 uint8 데이터를 float으로 변환해 배열로 넣습니다.

  * 복사하는 인덱스의 시작 offset을 0과 1로 계속 변경하도록 합니다.

```swift
func testLoop() {

            let image = UIImage(named: "grayscaled_image_name")!.cgImage!
            let data = image.dataProvider!.data! as NSData
            let size = CFDataGetLength(data)

             self.measure {
                let bytes = UnsafePointer<UInt8>(data.bytes)
                var floats = [Float].init(repeating: 0, count: size/2)
                for iteration in 0..<10000 {
                    let offset = iteration % 2
                    for i in 0..<floats.count {
                        floats[i] = Float(bytes.advanced(by: i * 2 + offset).pointee)
                    }
                }
            }
        }
```

_수정 전 기록: avg 0.065 ~ 0.067sec, 표준편차 8%. 위 수정본의 결과가 아닙니다._

## 먼저 계산 결과부터 확인하기

원래 vDSP 코드는 바깥 반복의 `i % 2`를 offset으로 썼지만, loop 코드는 요소 인덱스의 `i % 2`를 썼습니다. 전자는 `0, 2, 4, …` 또는 `1, 3, 5, …`를 읽고, 후자는 `0, 3, 4, 7, …`를 읽었습니다. 같은 작업이 아니었던 셈입니다.

비교 전에 입력을 `[0, 1, 2, 3, 4, 5, 6, 7]`처럼 작고 구분 가능한 값으로 만들고, offset 0에서 `[0, 2, 4, 6]`, offset 1에서 `[1, 3, 5, 7]`이 두 구현 모두 나오는지 확인해야 합니다. 이는 기대값이지 이번에 vDSP를 실행한 결과는 아닙니다.

또한 위 이미지 코드는 **행 패딩 없는 8비트 그레이스케일+알파 2채널**을 전제로 합니다. 임의의 UIImage 데이터가 이 형식이라는 보장은 없습니다. 실제 이미지라면 색상 공간, bitsPerComponent, bitsPerPixel, bytesPerRow를 확인하거나 그 형식으로 변환한 버퍼를 써야 합니다.

## 결론

당시 측정에서는 vDSP 쪽 시간이 작았지만, 서로 다른 일을 측정했으므로 “5배 이상 빠르다”는 비교 결론은 철회합니다. 편차가 큰 이유를 SIMD나 병렬 처리 때문이라고 특정할 근거도 부족합니다.

다시 측정한다면 같은 입력·offset·출력 초기화 조건에서 정확성을 먼저 검증하고, 최적화 옵션과 기기/OS를 기록해야겠습니다. 워밍업, 반복 수, 결과 사용 여부도 맞춰야 합니다. 일반 loop가 항상 느린 것은 아니며 크기와 연산에 따라 확인할 문제입니다.

- [Apple vDSP Programming Guide: 구현 선택과 stride](https://developer.apple.com/library/archive/documentation/Performance/Conceptual/vDSP_Programming_Guide/About_vDSP/About_vDSP.html)


<details>
<summary>수정 전 두 실험 코드 보관</summary>

**과거 실험 원문:** 서로 다른 인덱스를 읽고 vDSP에만 초기화가 포함된 코드입니다. 본문의 과거 시간 수치는 아래 코드에서 얻은 기록이며 공정한 성능 비교에 사용할 수 없습니다. Xcode 8 beta 2 문법입니다.

```swift
func testAccelerate() {
            // This is an example of a performance test case.
            let image = UIImage(named: "grayscaled_image_name")!.cgImage!
            let data = image.dataProvider!.data! as NSData
            let size = CFDataGetLength(data)

            self.measure {
                let bytes = data.bytes
                var floats = [Float].init(repeating: 0, count: size/2)
                for i in 0..<10000 {
                    vDSP_vfltu8(UnsafePointer<UInt8>(bytes).advanced(by: i % 2), 2, &floats, 1, vDSP_Length(size/2))
                    var float: Float = 0
                    vDSP_vfill(&float, &floats, 1, vDSP_Length(floats.count))
                }
            }

        }
```

```swift
func testLoop() {

            let image = UIImage(named: "grayscaled_image_name")!.cgImage!
            let data = image.dataProvider!.data! as NSData
            let size = CFDataGetLength(data)

             self.measure {
                let bytes = UnsafePointer<UInt8>(data.bytes)
                var floats = [Float].init(repeating: 0, count: size/2)
                for _ in 0..<10000 {
                    for i in 0..<floats.count {
                        floats[i] = Float(bytes.advanced(by: i * 2 + (i % 2)).pointee)
                    }
                }
            }
        }
```

</details>
