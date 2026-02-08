export const categories = [
  { key: 'all', label: '전체' },
  { key: 'swift', label: 'Swift' },
  { key: 'ios', label: 'iOS' },
  { key: 'math-cs', label: '수학/CS' },
  { key: 'tools', label: '도구' },
  { key: 'unicode', label: '유니코드' },
  { key: 'etc', label: '기타' },
] as const;

const categoryMap: Record<string, string> = {
  // Swift (30)
  'swift': 'swift',
  'swift-5-0': 'swift',
  'swift4-1-diff': 'swift',
  'swift-high-performance': 'swift',
  'swift-pointer': 'swift',
  'swift-source': 'swift',
  'swift_compiler_architecture': 'swift',
  'silrst': 'swift',
  'sil-study': 'swift',
  'abi_stability_and_more': 'swift',
  'performancing-swift-1': 'swift',
  'performancing-swift-2': 'swift',
  'performancing-swift-3': 'swift',
  'accelerate-performance': 'swift',
  'swift-asserts-the-missing-manual': 'swift',
  'bool': 'swift',
  'errortype': 'swift',
  'custom-operator-pattern-matching': 'swift',
  'deferable-for-swift-and-more-smaller-defer': 'swift',
  'memory-thread-array': 'swift',
  'memory-thread-array-2': 'swift',
  'rxswift': 'swift',
  'rx': 'swift',
  'crash_combine_ios13': 'swift',
  'mixing-swift-and-objective-c-for-framework': 'swift',
  'observe-in-initializer': 'swift',
  'counts-by-language': 'swift',
  'uselesses': 'swift',
  'app-runtime': 'swift',
  'learn-computer-science-with-swift': 'swift',

  // iOS (10)
  'ios': 'ios',
  'iosvulnerabilities': 'ios',
  'coredata': 'ios',
  'uiview-hidden': 'ios',
  'finish-handle-for-operation-queue': 'ios',
  'translate-view-controller-programming-guide-for-ios': 'ios',
  'view-etc': 'ios',
  'reading-apple-development-documentation': 'ios',
  'xcode9-3-release-note': 'ios',
  'macos-tips': 'ios',

  // 수학/CS (7)
  'concrete-mathematics': 'math-cs',
  'mathematical-induction': 'math-cs',
  'discrete-mathematics': 'math-cs',
  'the-foundations-logic-and-proofs': 'math-cs',
  'coding-the-matrix': 'math-cs',
  'cartesian': 'math-cs',
  'test-drive-development-by-example': 'math-cs',

  // 도구 (8)
  'vim': 'tools',
  'vim-primer': 'tools',
  'vimstudying': 'tools',
  'vimwikitips': 'tools',
  'vimwiki-jekyll-ghpage': 'tools',
  'git-tips': 'tools',
  'vsc-lsp': 'tools',
  'settings': 'tools',

  // 유니코드 (2)
  'unicode': 'unicode',
  'chronology_unicode': 'unicode',

  // 기타 (10)
  '2kotlin-getting-started-basic-syntax': 'etc',
  'diary': 'etc',
  'wiki-index': 'etc',
  'wiki-todo': 'etc',
  'rollmind': 'etc',
  'solving-problems': 'etc',
  'study': 'etc',
  'developing': 'etc',
  'readings': 'etc',
  'readordie': 'etc',
  'todos': 'etc',
};

export function getCategory(slug: string): string {
  return categoryMap[slug] ?? 'etc';
}
