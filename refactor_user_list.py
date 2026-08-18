import re

file_path = 'frontend/src/app/components/user-list/user-list.component.scss'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The structural CSS to add to &__body
structural_css = """
    .p-datatable {
      border-radius: 0.85rem;
      overflow: hidden;

      .p-datatable-header,
      .p-datatable-footer {
        border: none;
      }

      table {
        table-layout: fixed;
        width: 100%;
      }

      .p-datatable-thead > tr > th {
        font-weight: 800;
        padding: 0.85rem 1rem;
        border-bottom-style: solid;
        border-bottom-width: 2px;
      }

      .p-datatable-tbody > tr > td {
        border-bottom-style: solid;
        border-bottom-width: 1px;
        padding: 0.85rem 1rem;
        vertical-align: middle;

        &.user-list__id {
          font-weight: 800;
        }

        &.user-list__email-cell {
          max-width: 240px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .p-paginator {
      border: none;
      border-top-style: solid;
      border-top-width: 1px;
      border-bottom-left-radius: 0.85rem;
      border-bottom-right-radius: 0.85rem;
      padding: 0.5rem 1.25rem;
      min-height: 2.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.75rem;

      .p-paginator-current {
        font-weight: 600;
      }

      .p-paginator-pages .p-paginator-page,
      .p-paginator-first,
      .p-paginator-prev,
      .p-paginator-next,
      .p-paginator-last {
        border-radius: 0.45rem;
        font-weight: 700;
        min-width: 1.85rem;
        height: 1.85rem;
        padding: 0 0.4rem;
        font-size: 0.88rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin: 0 0.15rem;
        border-style: solid;
        border-width: 1px;
      }
    }
"""

dark_mode_css = """
  .user-list__body {
    .p-datatable {
      border: 1px solid var(--border);
      background-color: var(--bg-card);
      color: var(--text-primary);

      .p-datatable-header,
      .p-datatable-footer {
        background-color: var(--bg-card);
        color: var(--text-primary);
      }

      .p-datatable-thead > tr > th {
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        border-bottom-color: var(--border);
        transition: background-color 0.2s ease;
      }

      .p-datatable-tbody > tr > td {
        background-color: var(--bg-card);
        color: var(--text-primary);
        border-bottom-color: var(--border);

        &.user-list__id {
          color: var(--accent-copper);
        }
      }

      .p-datatable-tbody > tr:nth-child(even) > td {
        background-color: var(--bg-secondary);
      }

      .p-datatable-tbody > tr:hover > td {
        background-color: rgba(236, 180, 77, 0.12);
        color: var(--c-off-white);
      }
    }

    .p-paginator {
      background-color: var(--bg-card);
      color: var(--text-primary);
      border-top-color: var(--border);

      .p-paginator-current {
        color: var(--text-secondary);
      }

      .p-paginator-pages .p-paginator-page,
      .p-paginator-first,
      .p-paginator-prev,
      .p-paginator-next,
      .p-paginator-last {
        color: var(--text-primary);
        background-color: transparent;
        border-color: transparent;

        &.p-highlight {
          background-color: var(--accent-copper);
          color: var(--c-white);
          border-color: var(--accent-copper);
        }

        &:hover:not(.p-highlight):not(.p-disabled) {
          background-color: rgba(111, 184, 230, 0.22);
          color: var(--c-off-white);
        }

        &.p-disabled {
          opacity: 0.4;
          color: var(--text-muted);
        }
      }
    }
  }
"""

light_mode_css = """
  .user-list__body {
    .p-datatable {
      border: 1px solid #cdd8e8;
      background-color: var(--c-white);
      color: var(--c-dark-slate);

      .p-datatable-header,
      .p-datatable-footer {
        background-color: var(--c-white);
        color: var(--c-dark-slate);
      }

      .p-datatable-thead > tr > th {
        background-color: #f4f8fc;
        color: var(--c-dark-slate);
        border-bottom-color: #cdd8e8;
      }

      .p-datatable-tbody > tr > td {
        background-color: var(--c-white);
        color: var(--c-dark-slate);
        border-bottom-color: #e2ebf5;

        &.user-list__id {
          color: #D4952B;
        }
      }

      .p-datatable-tbody > tr:nth-child(even) > td {
        background-color: #f9fbfd;
      }

      .p-datatable-tbody > tr:hover > td {
        background-color: rgba(42, 111, 219, 0.08);
        color: var(--c-dark-bg);
      }
    }

    .p-paginator {
      background-color: var(--c-white);
      color: var(--c-dark-slate);
      border-top-color: #e2ebf5;

      .p-paginator-current {
        color: #4a5d7c;
      }

      .p-paginator-pages .p-paginator-page,
      .p-paginator-first,
      .p-paginator-prev,
      .p-paginator-next,
      .p-paginator-last {
        color: var(--c-dark-slate);
        background-color: transparent;
        border-color: transparent;

        &.p-highlight {
          background-color: var(--c-primary-blue);
          color: var(--c-white);
          border-color: var(--c-primary-blue);
        }

        &:hover:not(.p-highlight):not(.p-disabled) {
          background-color: rgba(42, 111, 219, 0.12);
          color: var(--c-dark-bg);
        }

        &.p-disabled {
          opacity: 0.4;
          color: #94a3b8;
        }
      }
    }
  }
"""

# Insert structural_css into the base &__body { block
body_match = re.search(r'(&__body\s*\{\s*background-color:\s*var\(--bg-card\);\s*color:\s*var\(--text-primary\);\s*padding:\s*1\.6rem 2rem;\s*)(\})', content, re.MULTILINE)
if body_match:
    content = content[:body_match.start(2)] + structural_css + content[body_match.end(1):]

# Replace dark mode duplicated body block
# Find the .user-list__body block inside :host, :host-context([data-theme="dark"])
import textwrap

dark_regex = r'\.user-list__body\s*\{\s*\.p-datatable.*?\}\s*\}\s*\}'
# Actually, since doing regex for balanced braces is hard, let's just use string search between specific markers
dark_start_marker = '.user-list__body {\n    .p-datatable {'
light_start_marker = '.user-list__body {\n    .p-datatable {'

# We know their approximate positions. We can split the content.
# Wait, it's safer to just let me use re.sub with DOTALL.
# But it's risky.
# Let's extract blocks manually by lines

lines = content.split('\n')
new_lines = []
skip = False
brace_level = 0
in_dark_body = False
in_light_body = False
in_host_context_dark = False
in_host_context_light = False

for line in lines:
    if ':host,' in line or ':host-context([data-theme="dark"])' in line:
        in_host_context_dark = True
    if ':host-context([data-theme="light"])' in line:
        in_host_context_light = True
        
    if line.strip() == '}' and brace_level == 1:
        if in_host_context_dark: in_host_context_dark = False
        if in_host_context_light: in_host_context_light = False

    if '{' in line: brace_level += line.count('{')
    if '}' in line: brace_level -= line.count('}')

    # check if we enter .user-list__body in either host block
    if '.user-list__body {' in line and brace_level == 2 and (in_host_context_dark or in_host_context_light):
        skip = True
        if in_host_context_dark:
            new_lines.append(dark_mode_css)
        elif in_host_context_light:
            new_lines.append(light_mode_css)
        continue
        
    if skip:
        if brace_level < 2:
            skip = False
            # Append the closing brace if we need to? No, the dark_mode_css already has the balanced braces!
            # Wait, dark_mode_css HAS the closing brace for .user-list__body!
            pass
        else:
            continue
            
    if not skip:
        new_lines.append(line)

final_content = '\n'.join(new_lines)
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(final_content)
    
print("Merged user-list__body duplicates")
