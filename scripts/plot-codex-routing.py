#!/usr/bin/env python3
"""Render the article's SVG figures from published trial data.

uv run --with matplotlib==3.10.8 python scripts/plot-codex-routing.py
Use --font with a Korean font file on hosts without Apple SD Gothic Neo.
"""
import argparse
import json
from pathlib import Path
from statistics import mean

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager, ticker
from matplotlib.patches import Patch

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets/images/posts/codex-routing'
GREEN = '#397d45'
GRAY = '#a7b5ae'
PLAN = '#b6c8cf'
ORANGE = '#b8632c'
INK = '#26332d'


def canvas(title, unit, labels):
    fig, ax = plt.subplots(figsize=(5, 3.75))
    fig.subplots_adjust(left=.22, right=.96, bottom=.23, top=.80)
    fig.text(.03, .96, title, ha='left', va='top', fontsize=18, color=INK)
    ax.set_yticks(range(len(labels)), labels)
    ax.set_ylim(len(labels) - .4, -.6)
    ax.set_xlabel(unit, labelpad=12)
    ax.tick_params(axis='both', length=0, pad=9)
    ax.xaxis.set_major_locator(ticker.MaxNLocator(nbins=3))
    ax.grid(axis='x', color='#e4e9e6', linewidth=.8)
    ax.set_axisbelow(True)
    for spine in ax.spines.values():
        spine.set_visible(False)
    return fig, ax


def save(fig, name, description, previews):
    target = ASSETS / f'{name}.svg'
    fig.savefig(target, metadata={
        'Date': None, 'Title': description, 'Description': description,
        'Creator': 'Matplotlib; plot-codex-routing.py',
    })
    target.write_text('\n'.join(line.rstrip() for line in target.read_text().splitlines()) + '\n')
    if previews:
        fig.savefig(previews / f'{name}.png', dpi=150)
    plt.close(fig)


def bars(name, title, unit, labels, values, colors, previews, signed=False):
    fig, ax = canvas(title, unit, labels)
    ax.barh(range(len(labels)), values, height=.57, color=colors)
    if signed:
        extent = max(abs(v) for v in values) * 1.45
        ax.set_xlim(-extent, extent)
        ax.axvline(0, color='#8c9b93', linewidth=1)
        ax.xaxis.set_major_formatter(ticker.PercentFormatter(100, decimals=0))
    else:
        ax.set_xlim(0, max(values) * 1.27)
    pad = (ax.get_xlim()[1] - ax.get_xlim()[0]) * .02
    for y, value in enumerate(values):
        label = f'{value:+.1f}%' if signed else f'{value:.1f}'
        if signed and value < 0:
            ax.text(value / 2, y, label, va='center', ha='center', fontsize=16, color='white')
        else:
            ax.text(value + pad, y, label, va='center', ha='left', fontsize=16)
    save(fig, name, title + ': ' + '; '.join(f'{k} {v:.1f}' for k, v in zip(labels, values)), previews)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--font', type=Path, default=Path('/System/Library/Fonts/AppleSDGothicNeo.ttc'))
    parser.add_argument('--preview-dir', type=Path)
    args = parser.parse_args()
    if not args.font.is_file():
        parser.error('한글 폰트 파일을 --font로 지정하세요.')
    font_manager.fontManager.addfont(str(args.font))
    plt.rcParams.update({
        'font.family': font_manager.FontProperties(fname=args.font).get_name(),
        'font.size': 16.5, 'text.color': INK, 'axes.labelcolor': INK,
        'xtick.color': INK, 'ytick.color': INK, 'axes.unicode_minus': False,
        'svg.fonttype': 'path', 'svg.hashsalt': 'codex-routing-2026-09-12',
        'figure.facecolor': 'white', 'axes.facecolor': 'white',
    })
    data = json.loads((ROOT / 'public/assets/data/codex-routing-2026-09-12.json').read_text())
    rows = [r for r in data['trials'] if r['status'] == 'PASS']
    assert len(data['trials']) == 156 and len(rows) == 155
    ASSETS.mkdir(parents=True, exist_ok=True)
    if args.preview_dir:
        args.preview_dir.mkdir(parents=True, exist_ok=True)

    def group(condition, effort=None):
        return [r for r in rows if r['condition'] == condition
                and (effort is None or r['astra_effort'] == effort)]

    def value(row, metric):
        return row['total_usage']['total_tokens'] / 1000 if metric == 'tokens' else row['elapsed_from_logs_s']

    # Same six tasks; only low effort for Astra, max for every Luna role.
    labels = ['A', 'L', 'AA', 'AL', 'LA', 'LL']
    groups = [group(c, 'low' if 'A' in c else None) for c in labels]
    assert all(len(g) == 6 for g in groups)
    for metric, title, unit in [('tokens', '평균 보고 토큰', '천 토큰 / 문제'),
                                ('seconds', '평균 실행시간', '초 / 문제')]:
        bars(f'configurations-{metric}', title, unit, labels,
             [mean(value(r, metric) for r in g) for g in groups],
             [GREEN, GREEN, GRAY, GRAY, GRAY, GRAY], args.preview_dir)

    # One baseline each for L/LL; Astra groups contain all six efforts.
    labels = ['A', 'AA', 'L', 'LL']
    for metric, title, unit in [('tokens', '단계별 보고 토큰', '천 토큰 / 문제'),
                                ('seconds', '단계별 실행시간', '초 / 문제')]:
        fig, ax = canvas(title, unit, labels)
        planned, implemented = [], []
        for condition in labels:
            g = group(condition)
            for role, result in [('planner', planned), ('implementer', implemented)]:
                result.append(mean((r[f'{role}_usage']['total_tokens'] / 1000 if metric == 'tokens'
                                    else r[f'{role}_elapsed_s'] or 0) for r in g))
        totals = [p + i for p, i in zip(planned, implemented)]
        ax.barh(range(4), planned, height=.57, color=PLAN)
        ax.barh(range(4), implemented, left=planned, height=.57, color=GREEN)
        ax.set_xlim(0, max(totals) * 1.06)
        fig.legend(handles=[Patch(color=PLAN, label='계획'), Patch(color=GREEN, label='구현')],
                   loc='upper left', bbox_to_anchor=(.18, .87), ncols=2,
                   frameon=False, fontsize=15, handlelength=1, columnspacing=1.2)
        ax.set_position([.22, .23, .74, .48])
        for y, (p, i) in enumerate(zip(planned, implemented)):
            if p:
                ax.text(p / 2, y, f'{p:.1f}', ha='center', va='center', fontsize=15, color=INK)
            ax.text(p + i / 2, y, f'{i:.1f}', ha='center', va='center', fontsize=15, color='white')
        save(fig, f'planning-{metric}', title + ' (A/AA n=36, L/LL n=6)', args.preview_dir)

    # Paired AL/LA comparisons exclude the interrupted quicksort pair on both sides.
    efforts = data['astra_efforts']
    for metric, title in [('tokens', 'AL의 토큰 절감률'), ('seconds', 'AL의 시간 절감률')]:
        changes, sizes = [], []
        for effort in efforts:
            a = {r['task']: r for r in group('AL', effort)}
            b = {r['task']: r for r in group('LA', effort)}
            common = a.keys() & b.keys()
            sizes.append(len(common))
            changes.append(100 * (1 - sum(value(a[t], metric) for t in common)
                                   / sum(value(b[t], metric) for t in common)))
        assert sizes == [6, 6, 6, 5, 6, 6]
        bars(f'al-la-{metric}', title, 'LA 대비 절감률', efforts, changes,
             [GREEN if n >= 0 else ORANGE for n in changes], args.preview_dir, signed=True)

    for metric, title, unit in [('tokens', 'A의 평균 보고 토큰', '천 토큰 / 문제'),
                                ('seconds', 'A의 평균 실행시간', '초 / 문제')]:
        bars(f'effort-{metric}', title, unit, efforts,
             [mean(value(r, metric) for r in group('A', e)) for e in efforts],
             [GREEN] + [GRAY] * 5, args.preview_dir)
    print(f'8 SVG figures: {ASSETS}')


if __name__ == '__main__':
    main()
