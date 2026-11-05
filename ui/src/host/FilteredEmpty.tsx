import { i18nT } from '../i18n'

/** The dashboard's "no matches for …" row with its clear link (`components/ui`
 *  `FilteredEmpty`), which the App Kit does not export. */
export function FilteredEmpty({ query, onClear, noun, testId = 'filtered-empty' }: { query: string; onClear: () => void; noun?: string; testId?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-1.5 animate-rise" data-testid={testId}>
      <div className="text-muted text-sm">
        {noun
          ? i18nT('components.ui.no_noun_match', { noun })
          : i18nT('components.ui.no_matches_for')}{' '}
        <span className="font-medium text-text">&ldquo;{query}&rdquo;</span>
      </div>
      <button
        onClick={onClear}
        className="text-accent text-[13px] hover:underline cursor-pointer bg-transparent border-none p-0"
        data-testid={`${testId}-clear`}
      >
        {i18nT('components.ui.clear_filter')}
      </button>
    </div>
  )
}
