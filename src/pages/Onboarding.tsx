import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const schema = z.object({
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  goals: z.array(z.enum(['Grow wealth', 'Income', 'Preserve capital', 'Speculative', 'Learn'])).min(1),
  timeHorizon: z.enum(['<1y', '1–3y', '3–5y', '5–10y', '10+']),
  riskScore: z.number().int().min(1).max(5),
  incomeRange: z.enum(['<$50k', '$50k–$100k', '$100k–$250k', '$250k–$1M', '$1M+']).optional(),
  netWorthRange: z.enum(['<$100k', '$100k–$500k', '$500k–$1M', '$1M–$5M', '$5M+']).optional(),
  liquidityNeeds: z.enum(['Low', 'Moderate', 'High']).optional(),
  knowledge: z.enum(['Novice', 'Intermediate', 'Expert']).optional(),
})

type FormValues = z.infer<typeof schema>

export default function Onboarding() {
  const { completeOnboarding, user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const defaultValues = useMemo<FormValues>(() => ({
    experienceLevel: user?.profile.experienceLevel ?? 'Beginner',
    goals: user?.profile.goals ?? ['Grow wealth'],
    timeHorizon: user?.profile.timeHorizon ?? '3–5y',
    riskScore: user?.profile.riskScore ?? 3,
    incomeRange: user?.profile.incomeRange,
    netWorthRange: user?.profile.netWorthRange,
    liquidityNeeds: user?.profile.liquidityNeeds,
    knowledge: user?.profile.knowledge,
  }), [user])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    values: defaultValues,
  })

  const onSubmit = (values: FormValues) => {
    setError(null)
    try {
      completeOnboarding({
        experienceLevel: values.experienceLevel,
        goals: values.goals,
        timeHorizon: values.timeHorizon,
        riskScore: values.riskScore as 1 | 2 | 3 | 4 | 5,
        incomeRange: values.incomeRange,
        netWorthRange: values.netWorthRange,
        liquidityNeeds: values.liquidityNeeds,
        knowledge: values.knowledge,
      })
      navigate('/', { replace: true })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to complete onboarding'
      setError(message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Tell us about your investing</CardTitle>
          <CardDescription>We’ll personalize Sharpeful to your goals</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                            checked={(form.watch('goals') ?? []).includes(g as FormValues['goals'][number])}
                            onCheckedChange={(checked) => {
                              const current = form.getValues('goals')
                              const goal = g as FormValues['goals'][number]
                              if (checked === true) {
                                const next: FormValues['goals'] = Array.from(new Set([...(current ?? []), goal]))
                                form.setValue('goals', next)
                              } else {
                                const next: FormValues['goals'] = (current ?? []).filter((x) => x !== goal)
                                form.setValue('goals', next)
                              }
                            }}
                          />
                          <span className="text-sm">{g}</span>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
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
                          <SelectValue placeholder="Select time horizon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['<1y', '1–3y', '3–5y', '5–10y', '10+'].map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riskScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk tolerance</FormLabel>
                    <RadioGroup
                      className="grid grid-cols-5 gap-2"
                      onValueChange={(v) => field.onChange(Number(v))}
                      defaultValue={field.value ? String(field.value) : undefined}>
                    
                      {[1,2,3,4,5].map((n) => (
                        <div key={n} className="flex items-center space-x-2">
                          <RadioGroupItem value={String(n)} id={`risk-${n}`} />
                          <label htmlFor={`risk-${n}`} className="text-sm">
                            {n === 1 ? 'Very Low' : n === 5 ? 'Very High' : n}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                    <FormMessage />
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

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <div className="flex justify-end">
                <Button type="submit">Finish</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
