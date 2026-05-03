'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

interface WeeklyPoint {
  week: string
  docs: number
  pets: number
}

interface TopPet {
  id: string
  display_name: string
  count: number
}

interface Props {
  weekly: WeeklyPoint[]
  topViewed: TopPet[]
  topLiked: TopPet[]
}

const DOCS_COLOR = '#71717a'
const PETS_COLOR = '#f43f5e'

function TopList({ items, label }: { items: TopPet[]; label: string }) {
  const max = Math.max(...items.map((i) => i.count), 1)
  return (
    <div>
      <h2 className="text-sm font-semibold mb-3">{label}</h2>
      <div className="border border-border rounded-xl p-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No data yet.</p>
        ) : (
          items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium truncate">{item.display_name}</p>
                  <span className="text-xs text-muted-foreground tabular-nums ml-2 shrink-0">{item.count.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-foreground/60 transition-all"
                    style={{ width: `${(item.count / max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function AdminCharts({ weekly, topViewed, topLiked }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold mb-3">Weekly activity</h2>
        <div className="border border-border rounded-xl p-4">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekly} barGap={2} barCategoryGap="30%">
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid hsl(240 3.7% 10%)',
                  background: 'hsl(240 5% 4%)',
                  color: '#fff',
                }}
                cursor={{ fill: 'hsl(240 3.7% 15%)', radius: 4 }}
              />
              <Bar dataKey="docs" name="Docs" fill={DOCS_COLOR} radius={[3, 3, 0, 0]} />
              <Bar dataKey="pets" name="Pets" fill={PETS_COLOR} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: DOCS_COLOR }} />
              Docs
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PETS_COLOR }} />
              Pets
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <TopList items={topViewed} label="Top 5 most viewed pets" />
        <TopList items={topLiked} label="Top 5 most liked pets" />
      </div>
    </div>
  )
}
