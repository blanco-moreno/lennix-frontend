/** Breadcrumb. The last crumb is the current page: text, not a link, marked `aria-current="page"`. */

import { Breadcrumb as ChakraBreadcrumb } from '@chakra-ui/react'
import { Fragment } from 'react'
import { Link } from 'react-router'

export interface BreadcrumbCrumb {
  label: string
  /** Omitted on the last crumb — the page you are already on. */
  to?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbCrumb[]
  /** Names the landmark for screen readers, e.g. "Breadcrumb". */
  label: string
}

export function Breadcrumb({ items, label }: BreadcrumbProps) {
  return (
    <ChakraBreadcrumb.Root
      size="sm"
      aria-label={label}
      data-testid="breadcrumb"
    >
      {/* The trail wraps by crumb, never inside one. Squeezed into a narrow
          header without this, "Proyectos" came out as "Proyecto" and a lone
          "s" on the next line. */}
      <ChakraBreadcrumb.List
        flexWrap="wrap"
        css={{ '& > *': { whiteSpace: 'nowrap' } }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          // The separator is a sibling of the item, not a child: both render
          // as `<li>`, and nesting one inside the other is invalid HTML.
          return (
            <Fragment key={`${item.label}-${index}`}>
              <ChakraBreadcrumb.Item>
                {isLast || !item.to ? (
                  <ChakraBreadcrumb.CurrentLink color="primary">
                    {item.label}
                  </ChakraBreadcrumb.CurrentLink>
                ) : (
                  <ChakraBreadcrumb.Link asChild color="fg.muted">
                    <Link to={item.to}>{item.label}</Link>
                  </ChakraBreadcrumb.Link>
                )}
              </ChakraBreadcrumb.Item>
              {!isLast && <ChakraBreadcrumb.Separator />}
            </Fragment>
          )
        })}
      </ChakraBreadcrumb.List>
    </ChakraBreadcrumb.Root>
  )
}
