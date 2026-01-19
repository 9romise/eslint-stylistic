import type { RuleInfo } from '@eslint-stylistic/metadata'
import type { Plugin } from 'vite'
import { basename, dirname } from 'node:path'
import { packages } from '@eslint-stylistic/metadata'
import graymatter from 'gray-matter'

export function MarkdownTransform(): Plugin {
  const shortId = 'default'
  const pkg = packages.find(p => p.shortId === shortId)!
  const ruleMapping = pkg.rules.reduce((prev, cur) => {
    prev[cur.name] = cur
    return prev
  }, {} as Record<string, RuleInfo>)

  function addExperimentalTip(rule: RuleInfo) {
    return `
      > [!IMPORTANT]
      > 🧪 This rule is an experimental rule, changes may not follow semver.
      >
      > Should prefix \`exp-\` when using. For example: \`${rule.ruleId}\`
    `.split('\n').map(l => l.trim()).join('\n')
  }

  function removeHeadings(content: string) {
    return content.trimStart().replace(/^# .*\n/, '')
  }

  function addDefaultOptions(content: string) {
    // TODO
    return content
  }

  function resolveLink(link: string) {
    if (!URL.canParse(link) && !ruleMapping[link]) {
      return `https://eslint.org/docs/latest/rules/${link}`
    }

    return link
  }

  function addExtraLinks(title: string, links?: string[]) {
    if (!links?.length)
      return

    return [
      `## ${title}`,
      ...links.map(link => `- [${link}](${resolveLink(link)})`),
    ].join('\n')
  }

  return {
    name: 'local:markdown-transform',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('README.md'))
        return null

      const ruleName = basename(dirname(id))
      const rule = ruleMapping[ruleName]

      if (!rule)
        return null

      const {
        data,
        content,
      } = graymatter(code)

      const {
        experimental,
      } = rule.meta?.docs ?? {}

      const sup = experimental ? 'experimental' : ''

      return graymatter.stringify(
        [
          `# <samp>${rule.name}${sup ? ` <sup>${sup}</sup>` : ''}</samp>`,
          experimental ? addExperimentalTip(rule) : '',
          addDefaultOptions(removeHeadings(content)),
          addExtraLinks('Related Rules', data.related_rules),
          addExtraLinks('Further Reading', data.further_reading),
        ].join('\n'),
        { data },
      )
    },
  }
}
