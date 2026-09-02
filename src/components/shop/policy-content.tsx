import type { PolicyBlock } from '@/lib/policies'

export function PolicyContent({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-neutral-700">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2 key={i} className="pt-2 text-base font-semibold text-neutral-900">
                {block.text}
              </h2>
            )
          case 'bullets':
            return (
              <ul key={i} className="list-disc space-y-1 pe-5">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )
          case 'numbered':
            return (
              <ol key={i} className="list-decimal space-y-1 pe-5">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ol>
            )
          case 'paragraph':
            return (
              <p key={i}>
                {block.lines.map((line, j) => (
                  <span key={j}>
                    {j > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
            )
        }
      })}
    </div>
  )
}
