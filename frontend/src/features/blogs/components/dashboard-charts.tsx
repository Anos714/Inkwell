import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type YAxisTickContentProps,
} from 'recharts'

/**
 * Chart primitives adapted from EvilCharts (evilcharts.com) — the hatched
 * donut slice, rounded bars and restrained reveal animation — trimmed to the
 * journal's brass-and-paper palette. Charts are drawn as figures, not cards:
 * a hairline rule, a mono label, and the data itself.
 */

export type EntryRead = {
  title: string
  views: number
}

const numberFormat = new Intl.NumberFormat('en-GB')

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value
}

type ReadsTooltipProps = {
  active?: boolean
  payload?: Array<{ payload?: EntryRead }>
}

function ReadsTooltip({ active, payload }: ReadsTooltipProps) {
  const entry = payload?.[0]?.payload
  if (!active || !entry) return null

  return (
    <div className="max-w-64 border border-inkwell-rule bg-inkwell-950 px-3.5 py-3 shadow-xl shadow-black/20">
      <p className="font-serif text-[0.8rem] leading-5 text-inkwell-cream">{entry.title}</p>
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-inkwell-brass">
        {numberFormat.format(entry.views)} reads
      </p>
    </div>
  )
}

function useNarrowChart() {
  const [narrow, setNarrow] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(max-width: 639px)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)')
    const onChange = () => setNarrow(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return narrow
}

export function ReadsChart({ data }: { data: EntryRead[] }) {
  const reduceMotion = useReducedMotion()
  const narrow = useNarrowChart()

  const renderCategoryTick = (props: YAxisTickContentProps) => (
    <text
      x={props.x}
      y={props.y}
      dy={3}
      textAnchor="end"
      className="chart-axis-label"
    >
      {truncate(String(props.payload?.value ?? ''), narrow ? 14 : 29)}
    </text>
  )

  return (
    <div
      className="dashboard-chart h-[19rem] w-full"
      role="img"
      aria-label={data
        .map((entry) => `${entry.title}: ${numberFormat.format(entry.views)} reads`)
        .join('. ')}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 54, bottom: 4, left: 0 }}
          barCategoryGap={narrow ? 10 : 14}
        >
          <XAxis type="number" hide domain={[0, 'dataMax']} />
          <YAxis
            type="category"
            dataKey="title"
            width={narrow ? 108 : 190}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            interval={0}
            tick={renderCategoryTick}
          />
          <Tooltip content={<ReadsTooltip />} cursor={{ fill: 'var(--gold-soft)' }} />
          <Bar
            dataKey="views"
            fill="url(#reads-bar-fill)"
            radius={[0, 2, 2, 0]}
            isAnimationActive={!reduceMotion}
            animationDuration={900}
            animationEasing="ease-out"
          >
            <LabelList
              dataKey="views"
              position="right"
              offset={9}
              formatter={(value: unknown) => numberFormat.format(Number(value))}
              className="chart-value-label"
            />
          </Bar>
          <defs>
            <linearGradient id="reads-bar-fill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.92} />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity={0.46} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export type EditionSlice = {
  name: string
  value: number
  fill: string
}

export function EditionDonut({
  slices,
  total,
}: {
  slices: EditionSlice[]
  total: number
}) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-7 lg:flex-col lg:items-stretch">
      <div
        className="dashboard-chart relative h-44 w-44 shrink-0 self-center"
        role="img"
        aria-label={slices
          .map((slice) => `${slice.name}: ${slice.value}`)
          .join('. ')}
      >
        {total === 0 && (
          <span
            aria-hidden="true"
            className="absolute inset-[9%] rounded-full border border-dashed border-inkwell-rule"
          />
        )}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <pattern
                id="draft-hatch"
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(-45)"
              >
                <rect width="6" height="6" fill="var(--gold-soft)" />
                <rect width="1.5" height="6" fill="var(--gold)" fillOpacity={0.55} />
              </pattern>
            </defs>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="96%"
              startAngle={90}
              endAngle={-270}
              stroke="none"
              paddingAngle={2}
              isAnimationActive={!reduceMotion}
              animationDuration={900}
            >
              {slices.map((slice) => (
                <Cell
                  key={slice.name}
                  fill={slice.fill}
                  stroke={slice.fill.includes('url(') ? 'var(--rule-strong)' : 'none'}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <p className="font-display text-4xl leading-none tracking-[-0.03em] text-inkwell-cream">
            {String(total).padStart(2, '0')}
          </p>
          <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-inkwell-dim">
            Entries
          </p>
        </div>
      </div>

      <dl className="w-full space-y-0 self-center">
        {slices.map((slice, index) => (
          <div
            key={slice.name}
            className="flex items-center justify-between gap-4 border-t border-inkwell-rule py-2.5 first:border-t-0"
          >
            <dt className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-inkwell-muted">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0"
                style={{
                  background: slice.fill.startsWith('url(') ? 'var(--gold-soft)' : slice.fill,
                  border: index === 0 ? 'none' : '1px solid var(--gold)',
                }}
              />
              {slice.name}
            </dt>
            <dd className="font-mono text-[10px] tracking-[0.1em] text-inkwell-dim">
              {String(slice.value).padStart(2, '0')}
              <span className="ml-1.5 text-inkwell-brass">
                {total > 0 ? `${Math.round((slice.value / total) * 100)}%` : '0%'}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
