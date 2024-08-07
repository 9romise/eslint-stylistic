import type { TSESLint } from '@typescript-eslint/utils'
import type { Rule } from 'eslint'

export function createRule<RuleOptions extends any[], MessageIds extends string>(
  rule: Omit<TSESLint.RuleModule<MessageIds, RuleOptions>, 'defaultOptions'>,
) {
  return rule as unknown as Rule.RuleModule
}
