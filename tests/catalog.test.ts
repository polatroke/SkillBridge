import { test } from 'node:test'
import assert from 'node:assert/strict'
import { averageRating, diffIds, lessonCount, parseLessons, programPhase, programProgress } from '../src/lib/catalog.ts'
import type { Student } from '../src/types/index.ts'

function student(id: string, programId: string | undefined, completedCourseIds: string[]): Student {
  return {
    id,
    type: 'student',
    name: id,
    email: `${id}@aluno.example.com`,
    companyId: programId ? 'empresa-1' : undefined,
    programId,
    enrolledCourseIds: completedCourseIds,
    completedCourseIds,
    certificateIds: [],
    studyHours: 0,
  }
}

test('parseLessons: uma aula por linha, ignorando linhas vazias e espaços (inclusive \\r\\n)', () => {
  assert.deepEqual(parseLessons('Aula 1\n\n  Aula 2  \r\nAula 3\n'), ['Aula 1', 'Aula 2', 'Aula 3'])
  // Regressão: logo depois do Enter o texto termina em "\n" — isso não pode virar uma aula vazia.
  assert.deepEqual(parseLessons('Introdução\n'), ['Introdução'])
  assert.deepEqual(parseLessons(''), [])
})

test('diffIds devolve só o que entra e o que sai', () => {
  assert.deepEqual(diffIds(['a', 'b'], ['b', 'c']), { toAdd: ['c'], toRemove: ['a'] })
  assert.deepEqual(diffIds(['a', 'b'], ['b', 'a']), { toAdd: [], toRemove: [] })
  assert.deepEqual(diffIds([], ['x']), { toAdd: ['x'], toRemove: [] })
  assert.deepEqual(diffIds(['x'], []), { toAdd: [], toRemove: ['x'] })
})

test('programPhase usa as datas do treinamento, com os dois extremos inclusivos', () => {
  const program = { startDate: '2026-03-01', endDate: '2026-11-30' }
  assert.equal(programPhase(program, '2026-02-28'), 'em_breve')
  assert.equal(programPhase(program, '2026-03-01'), 'ativo')
  assert.equal(programPhase(program, '2026-11-30'), 'ativo')
  assert.equal(programPhase(program, '2026-12-01'), 'encerrado')
})

test('programProgress é a média da fração dos cursos do treinamento concluída por aluno', () => {
  const program = { id: 'p1', courseIds: ['c1', 'c2'] }
  const students = [
    student('metade', 'p1', ['c1']), // 50%
    student('tudo', 'p1', ['c1', 'c2']), // 100%
    student('so-publico', 'p1', ['curso-publico']), // 0%: curso fora do treinamento não conta
    student('outro-programa', 'p2', ['c1', 'c2']), // ignorado
  ]
  // (0.5 + 1 + 0) / 3 = 50%. A regra antiga ("concluiu algum curso") dava 100%.
  assert.equal(programProgress(program, students), 50)
  assert.equal(programProgress({ id: 'p1', courseIds: [] }, students), 0)
  assert.equal(programProgress({ id: 'vazio', courseIds: ['c1'] }, students), 0)
})

test('averageRating ignora sessões sem nota e não divide por zero', () => {
  assert.equal(averageRating([5, 4, null, undefined]), 4.5)
  assert.equal(averageRating([5, 4, 4]), 4.3)
  // Regressão do "NaN" em Relatórios: sessões concluídas, mas nenhuma avaliada.
  assert.equal(averageRating([null, undefined]), null)
  assert.equal(averageRating([]), null)
})

test('lessonCount soma as aulas de todos os módulos', () => {
  const modules = [
    { id: 'm1', title: 'A', duration: '1h', lessons: ['a', 'b'] },
    { id: 'm2', title: 'B', duration: '1h', lessons: [] },
    { id: 'm3', title: 'C', duration: '1h', lessons: ['c'] },
  ]
  assert.equal(lessonCount({ modules }), 3)
})
