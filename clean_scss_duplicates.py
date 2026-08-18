import os
import re

replacements = {
    'frontend/src/styles.scss': [
        (r'body \.btn-primary,\s*body \.btn\.btn-primary\s*\{', 'body .btn-primary {'),
        (r'body \.btn-outline-primary,\s*body \.btn\.btn-outline-primary\s*\{', 'body .btn-outline-primary {'),
        (r'input\[type="date"\],\s*body input\[type="date"\]\s*\{', 'body input[type="date"] {'),
        (r'\[data-theme="light"\] input\[type="date"\]::-webkit-calendar-picker-indicator,\s*:host-context\(\[data-theme="light"\]\) input\[type="date"\]::-webkit-calendar-picker-indicator\s*\{', '[data-theme="light"] input[type="date"]::-webkit-calendar-picker-indicator {'),
        (r'\.btn-close,\s*body \.btn-close\s*\{', 'body .btn-close {'),
        (r'\[data-theme="light"\] &,\s*:host-context\(\[data-theme="light"\]\) &\s*\{', '[data-theme="light"] & {'),
        (r'\.password-group,\s*body \.password-group\s*\{', 'body .password-group {'),
        (r'\.eye-btn,\s*button\.eye-btn\s*\{', '.eye-btn {'),
        (r'body\[data-theme="dark"\] \.p-paginator,\s*\[data-theme="dark"\] \.p-paginator\s*\{', '[data-theme="dark"] .p-paginator {'),
        (r'body\[data-theme="dark"\] \.p-datatable,\s*\[data-theme="dark"\] \.p-datatable\s*\{', '[data-theme="dark"] .p-datatable {'),
        (r'\[data-theme="light"\] body \.card-body small,\s*\[data-theme="light"\] body \.login-card__body small\s*\{', '[data-theme="light"] body .card-body small,\n[data-theme="light"] body .login-card__body small {')
    ],
    'frontend/src/app/components/catalog/catalog.component.scss': [
        (r'&--active,\s*p-button\.catalog__filter-btn--active\s*\{', '&--active {'),
        (r'\.catalog__filter-btn--active,\s*p-button\.catalog__filter-btn--active\s*\{', '.catalog__filter-btn--active {')
    ],
    'frontend/src/app/components/login/login.component.scss': [
        (r'&__submit-btn,\s*&__submit-btn\.btn\s*\{', '&__submit-btn {'),
        (r'\.login-card__submit-btn,\s*\.login-card__submit-btn\.btn\s*\{', '.login-card__submit-btn {')
    ],
    'frontend/src/app/components/user-form/user-form.component.scss': [
        (r'p-button\.user-form__submit-btn,\s*&__submit-btn\s*\{', '&__submit-btn {'),
        (r'p-button\.user-form__submit-btn,\s*\.user-form__submit-btn\s*\{', '.user-form__submit-btn {')
    ],
    'frontend/src/app/components/user-list/user-list.component.scss': [
        (r'&__header,\s*&__header\.card-header\s*\{', '&__header {'),
        (r'span\.user-list__badge,\s*&__badge\s*\{', '&__badge {'),
        (r'div\.user-list__body,\s*\.user-list__body\s*\{', '.user-list__body {')
    ]
}

for path, reps in replacements.items():
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old_pattern, new_replacement in reps:
            content = re.sub(old_pattern, new_replacement, content)
            
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)

print('Cleaned duplicates!')
