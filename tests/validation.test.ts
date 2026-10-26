import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cleanName, cnpjDigits, formatCnpj, isValidCnpj, safeHttpUrl } from '../src/lib/validation.ts'

test('isValidCnpj aceita CNPJs reais com ou sem máscara', () => {
  assert.equal(isValidCnpj('11.222.333/0001-81'), true)
  assert.equal(isValidCnpj('11222333000181'), true)
  assert.equal(isValidCnpj('33.000.167/0001-01'), true)
})

test('isValidCnpj recusa dígito verificador errado, sequências repetidas e tamanhos errados', () => {
  assert.equal(isValidCnpj('11.222.333/0001-80'), false)
  assert.equal(isValidCnpj('11.222.333/0001-18'), false)
  assert.equal(isValidCnpj('00.000.000/0000-00'), false)
  assert.equal(isValidCnpj('11111111111111'), false)
  assert.equal(isValidCnpj('123'), false)
  assert.equal(isValidCnpj(''), false)
})

test('formatCnpj aplica a máscara usada no banco, também durante a digitação', () => {
  assert.equal(formatCnpj('11222333000181'), '11.222.333/0001-81')
  assert.equal(formatCnpj('11.222.333/0001-81'), '11.222.333/0001-81')
  assert.equal(formatCnpj('1122'), '11.22')
  assert.equal(formatCnpj('112223330'), '11.222.333/0')
  // Dígitos além de 14 são descartados.
  assert.equal(formatCnpj('1122233300018199'), '11.222.333/0001-81')
  assert.equal(cnpjDigits('11.222.333/0001-81'), '11222333000181')
})

test('safeHttpUrl só deixa passar http(s)', () => {
  assert.equal(safeHttpUrl('https://github.com/aluno/projeto'), 'https://github.com/aluno/projeto')
  assert.equal(safeHttpUrl('  http://exemplo.com  '), 'http://exemplo.com/')
  assert.equal(safeHttpUrl('javascript:alert(1)'), null)
  assert.equal(safeHttpUrl('JavaScript:alert(1)'), null)
  assert.equal(safeHttpUrl('data:text/html,<script>alert(1)</script>'), null)
  assert.equal(safeHttpUrl('ftp://exemplo.com/arquivo'), null)
  assert.equal(safeHttpUrl('não é uma url'), null)
  assert.equal(safeHttpUrl(''), null)
  assert.equal(safeHttpUrl(undefined), null)
})

test('cleanName normaliza espaços e recusa nomes vazios', () => {
  assert.equal(cleanName('  Ana   Paula  Souza '), 'Ana Paula Souza')
  assert.equal(cleanName('     '), null)
  assert.equal(cleanName('A'), null)
})
