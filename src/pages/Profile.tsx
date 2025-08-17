import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  riskTolerance: z.enum(['Low', 'Medium', 'High']).optional(),
  baseCurrency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']).optional(),
  timeZone: z.string().optional(),

  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  goals: z.array(z.enum(['Grow wealth', 'Income', 'Preserve capital', 'Speculative', 'Learn'])).optional(),
  timeHorizon: z.enum(['<1y', '1–3y', '3–5y', '5–10y', '10+']).optional(),
  riskScore: z.number().int().min(1).max(5).optional(),
  incomeRange: z.enum(['<$50k', '$50k–$100k', '$100k–$250k', '$250k–$1M', '$1M+']).optional(),
  netWorthRange: z.enum(['<$100k', '$100k–$500k', '$500k–$1M', '$1M–$5M', '$5M+']).optional(),
  liquidityNeeds: z.enum(['Low', 'Moderate', 'High']).optional(),
  knowledge: z.enum(['Novice', 'Intermediate', 'Expert']).optional(),
})

type FormValues = z.infer<typeof schema>

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [saved, setSaved] = useState(false)
  const defaults = useMemo<FormValues>(() => ({
    name: user?.profile.name ?? '',
    email: user?.profile.email ?? '',
    avatarUrl: user?.profile.avatarUrl ?? '',
    riskTolerance: user?.profile.riskTolerance,
    baseCurrency: user?.profile.baseCurrency ?? 'USD',
    timeZone: user?.profile.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,

    experienceLevel: user?.profile.experienceLevel,
    goals: user?.profile.goals ?? [],
    timeHorizon: user?.profile.timeHorizon,
    riskScore: user?.profile.riskScore,
    incomeRange: user?.profile.incomeRange,
    netWorthRange: user?.profile.netWorthRange,
    liquidityNeeds: user?.profile.liquidityNeeds,
    knowledge: user?.profile.knowledge,
  }), [user])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    values: defaults,
  })

  const onSubmit = (values: FormValues) => {
    updateProfile({
      name: values.name,
      email: values.email,
      avatarUrl: values.avatarUrl || undefined,
      riskTolerance: values.riskTolerance,
      baseCurrency: values.baseCurrency,
      timeZone: values.timeZone,

      experienceLevel: values.experienceLevel,
      goals: values.goals,
      timeHorizon: values.timeHorizon,
      riskScore: values.riskScore as 1 | 2 | 3 | 4 | 5 | undefined,
      incomeRange: values.incomeRange,
      netWorthRange: values.netWorthRange,
      liquidityNeeds: values.liquidityNeeds,
      knowledge: values.knowledge,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Manage your Sharpeful account information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="riskTolerance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk tolerance</FormLabel>
                        <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="baseCurrency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base currency</FormLabel>
                        <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="JPY">JPY</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                            <SelectItem value="AUD">AUD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeZone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time zone</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., America/New_York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeHorizon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time horizon</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['<1y', '1–3y', '3–5y', '5–10y', '10+'].map((h) => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="goals"
                  render={() => (
                    <FormItem>
                      <FormLabel>Primary goals</FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['Grow wealth', 'Income', 'Preserve capital', 'Speculative', 'Learn'].map((g) => (
                          <div key={g} className="flex items-center space-x-2">
                            <Checkbox
                              checked={(form.watch('goals') ?? []).includes(g as NonNullable<FormValues['goals']>[number])}
                              onCheckedChange={(checked) => {
                                const current = form.getValues('goals') ?? []
                                const goal = g as NonNullable<FormValues['goals']>[number]
                                if (checked === true) {
                                  const next: NonNullable<FormValues['goals']> = Array.from(new Set([...current, goal]))
                                  form.setValue('goals', next)
                                } else {
                                  const next: NonNullable<FormValues['goals']> = current.filter((x) => x !== goal)
                                  form.setValue('goals', next)
                                }
                              }}
                            />
                            <span className="text-sm">{g}</span>
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riskScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk tolerance (1–5)</FormLabel>
                      <RadioGroup
                        className="grid grid-cols-5 gap-2"
                        onValueChange={(v) => field.onChange(Number(v))}
                        defaultValue={field.value ? String(field.value) : undefined}
                      >
                        {[1,2,3,4,5].map((n) => (
                          <div key={n} className="flex items-center space-x-2">
                            <RadioGroupItem value={String(n)} id={`risk-${n}`} />
                            <label htmlFor={`risk-${n}`} className="text-sm">
                              {n === 1 ? 'Very Low' : n === 5 ? 'Very High' : n}
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="incomeRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual income (optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['<$50k', '$50k–$100k', '$100k–$250k', '$250k–$1M', '$1M+'].map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="netWorthRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Net worth (optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['<$100k', '$100k–$500k', '$500k–$1M', '$1M–$5M', '$5M+'].map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="liquidityNeeds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Liquidity needs (optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['Low', 'Moderate', 'High'].map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="knowledge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investment knowledge (optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['Novice', 'Intermediate', 'Expert'].map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit">Save changes</Button>
                {saved ? <span className="text-sm text-green-600 ml-2">Saved</span> : null}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
