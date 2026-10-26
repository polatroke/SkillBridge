import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatDateBR, nextDateForWeekday, toISODate } from '../src/lib/date.ts'
import { accountTypeForPath, homePathFor } from '../src/lib/routes.ts'
import { friendlyError, isMissingRpc, userError } from '../src/lib/errors.ts'

test('toISODate usa a data local (sem pular de dia pelo fuso UTC)', () => {
  assert.equal(toISODate(new Date(2026, 0, 5, 23, 30)), '2026-01-05')
  assert.equal(formatDateBR('2026-10-20'), '20/10/2026')
})

test('nextDateForWeekday sempre cai no dia pedido, entre amanhã e daqui a 7 dias', () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekdays = { Segunda: 1, Terça: 2, Quarta: 3, Quinta: 4, Sexta: 5, Sábado: 6 } as const
  for (const [name, index] of Object.entries(weekdays)) {
    const [y, m, d] = nextDateForWeekday(name as keyof typeof weekdays).split('-').map(Number)
    const date = new Date(y, m - 1, d)
    const days = Math.round((date.getTime() - today.getTime()) / 86_400_000)
    assert.equal(date.getDay(), index, name)
    assert.ok(days >= 1 && days <= 7, `${name}: ${days} dias`)
  }
})

test('accountTypeForPath identifica o painel dono da rota sem confundir prefixos', () => {
  assert.equal(accountTypeForPath('/aluno'), 'student')
  assert.equal(accountTypeForPath('/aluno/cursos/123?aula=0-1'), 'student')
  assert.equal(accountTypeForPath('/mentor/horarios'), 'mentor')
  assert.equal(accountTypeForPath('/empresa?aba=1'), 'company')
  assert.equal(accountTypeForPath('/mentoria'), undefined)
  assert.equal(accountTypeForPath('/alunos'), undefined)
  assert.equal(accountTypeForPath(undefined), undefined)
  assert.equal(homePathFor('company'), '/empresa')
})

test('friendlyError traduz códigos conhecidos e esconde mensagens internas do banco', () => {
  assert.equal(friendlyError({ code: '42501', message: 'new row violates row-level security policy' }, 'falhou'), 'Você não tem permissão para fazer isso.')
  assert.equal(friendlyError({ code: 'email_not_confirmed', message: 'Email not confirmed' }, 'falhou'), 'Confirme seu e-mail pelo link que enviamos antes de entrar.')
  // PostgrestError estende Error: antes as telas mostravam esse texto em inglês.
  assert.equal(friendlyError(new Error('duplicate key value violates unique constraint "mentors_email_key"'), 'falhou'), 'falhou')
  assert.equal(friendlyError(new TypeError('Failed to fetch'), 'falhou'), 'Sem conexão com o servidor. Verifique sua internet e tente novamente.')
  assert.equal(friendlyError(userError('Esse horário não está mais disponível.'), 'falhou'), 'Esse horário não está mais disponível.')
  assert.equal(friendlyError(null, 'falhou'), 'falhou')
  assert.equal(friendlyError('texto solto', 'falhou'), 'falhou')
})

test('isMissingRpc reconhece RPC ainda não publicada', () => {
  assert.equal(isMissingRpc({ code: 'PGRST202' }), true)
  assert.equal(isMissingRpc({ code: '42501' }), false)
  assert.equal(isMissingRpc(null), false)
})
